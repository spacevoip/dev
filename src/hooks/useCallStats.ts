import { useMemo } from 'react';
import type { CDRRecord } from '../types';
import { startOfDay, endOfDay, eachHourOfInterval, format, parseISO } from 'date-fns';

interface CallStats {
  totalCalls: number;
  averageMinutes: number;
  successRate: number;
  hourlyStats: {
    labels: string[];
    data: number[];
  };
  todayStats: {
    total: number;
    answered: number;
    noAnswer: number;
    totalMinutes: number;
  };
}

export function useCallStats(calls: CDRRecord[]): CallStats {
  return useMemo(() => {
    if (!calls.length) {
      return {
        totalCalls: 0,
        averageMinutes: 0,
        successRate: 0,
        hourlyStats: { labels: [], data: [] },
        todayStats: {
          total: 0,
          answered: 0,
          noAnswer: 0,
          totalMinutes: 0
        }
      };
    }

    // Estatísticas gerais
    const totalCalls = calls.length;
    const totalSeconds = calls.reduce((acc, call) => acc + (call.billsec || 0), 0);
    const averageMinutes = (totalSeconds / totalCalls) / 60;
    const answeredCalls = calls.filter(call => 
      call.disposition === 'ANSWERED' || 
      call.billsec > 0
    ).length;

    // Chamadas não atendidas (incluindo falhas)
    const noAnswerCalls = calls.filter(call => 
      call.disposition === 'NO ANSWER' || 
      call.disposition === 'FAILED' ||
      call.disposition === 'BUSY' ||
      (call.disposition !== 'ANSWERED' && call.billsec === 0)
    ).length;

    const successRate = (answeredCalls / totalCalls) * 100;

    // Estatísticas por hora
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const hoursToday = eachHourOfInterval({ start: startOfToday, end: endOfToday });
    
    const hourlyData = calls.reduce((acc, call) => {
      const callDate = typeof call.start === 'string' ? parseISO(call.start) : call.start;
      if (!isNaN(callDate.getTime())) {
        const hour = format(callDate, 'HH:00');
        acc[hour] = (acc[hour] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const hourlyStats = {
      labels: hoursToday.map(hour => format(hour, 'HH:00')),
      data: hoursToday.map(hour => hourlyData[format(hour, 'HH:00')] || 0)
    };

    // Estatísticas do dia
    const todayCalls = calls.filter(call => {
      const callDate = typeof call.start === 'string' ? parseISO(call.start) : call.start;
      return !isNaN(callDate.getTime()) && callDate >= startOfToday && callDate <= endOfToday;
    });

    const todayAnswered = todayCalls.filter(call => 
      call.disposition === 'ANSWERED' || 
      call.billsec > 0
    ).length;

    const todayNoAnswer = todayCalls.filter(call => 
      call.disposition === 'NO ANSWER' || 
      call.disposition === 'FAILED' ||
      call.disposition === 'BUSY' ||
      (call.disposition !== 'ANSWERED' && call.billsec === 0)
    ).length;

    const todayStats = {
      total: todayCalls.length,
      answered: todayAnswered,
      noAnswer: todayNoAnswer,
      totalMinutes: Math.round(todayCalls.reduce((acc, call) => acc + (call.billsec || 0), 0) / 60)
    };

    return {
      totalCalls,
      averageMinutes: Math.round(averageMinutes * 10) / 10,
      successRate: Math.round(successRate),
      hourlyStats,
      todayStats
    };
  }, [calls]);
}
