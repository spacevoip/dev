import { useMemo } from 'react';
import type { CDRRecord } from '../types';
import { startOfDay, endOfDay, eachHourOfInterval, format } from 'date-fns';

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
    failed: number;
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
          failed: 0,
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
    const successRate = (answeredCalls / totalCalls) * 100;

    // Estatísticas por hora
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    const hoursToday = eachHourOfInterval({ start: startOfToday, end: endOfToday });
    
    const hourlyData = calls.reduce((acc, call) => {
      const callDate = new Date(call.start);
      const hour = format(callDate, 'HH:00');
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hourlyStats = {
      labels: hoursToday.map(hour => format(hour, 'HH:00')),
      data: hoursToday.map(hour => hourlyData[format(hour, 'HH:00')] || 0)
    };

    // Estatísticas do dia
    const todayCalls = calls.filter(call => {
      const callDate = new Date(call.start);
      return callDate >= startOfToday && callDate <= endOfToday;
    });

    const todayAnswered = todayCalls.filter(call => 
      call.disposition === 'ANSWERED' || 
      call.billsec > 0
    ).length;

    const todayStats = {
      total: todayCalls.length,
      answered: todayAnswered,
      failed: todayCalls.length - todayAnswered,
      totalMinutes: Math.round(todayCalls.reduce((acc, call) => acc + (call.billsec || 0), 0) / 60)
    };

    return {
      totalCalls,
      averageMinutes: Math.round(averageMinutes * 10) / 10, // Uma casa decimal
      successRate: Math.round(successRate),
      hourlyStats,
      todayStats
    };
  }, [calls]);
}
