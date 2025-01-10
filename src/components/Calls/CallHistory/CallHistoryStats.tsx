import React from 'react';
import { Phone, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { CallHistory } from '../../../types';
import { formatDuration } from '../../../utils/formatters';

interface CallHistoryStatsProps {
  calls: CallHistory[];
}

export const CallHistoryStats: React.FC<CallHistoryStatsProps> = ({ calls }) => {
  const stats = React.useMemo(() => {
    const totalDuration = calls.reduce((acc, call) => acc + call.duration, 0);
    const answeredCalls = calls.filter(call => call.status.toLowerCase() === 'atendida');
    
    return {
      totalCalls: calls.length,
      totalDuration,
      avgDuration: calls.length ? Math.round(totalDuration / calls.length) : 0,
      successRate: calls.length ? (answeredCalls.length / calls.length) * 100 : 0
    };
  }, [calls]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-100">
            <Phone className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Chamadas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCalls}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100">
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Duração Média</p>
            <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.avgDuration)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Taxa de Sucesso</p>
            <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100">
            <XCircle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Duração Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
