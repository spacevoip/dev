import React from 'react';
import { Phone, Clock, PhoneCall, Activity } from 'lucide-react';
import type { ActiveCall } from '../../types';

interface CallsStatsProps {
  calls: ActiveCall[];
}

export const CallsStats: React.FC<CallsStatsProps> = ({ calls }) => {
  // Cálculo das estatísticas
  const totalCalls = calls.length;
  const activeCalls = calls.filter(call => call.status === 'Falando').length;
  const ringingCalls = calls.filter(call => call.status === 'Chamando').length;
  const avgDuration = calls.length 
    ? calls.reduce((acc, call) => acc + parseInt(call.duracao || '0', 10), 0) / calls.length 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de Chamadas */}
      <div className="bg-white rounded-xl p-4 border flex items-center">
        <div className="p-3 rounded-full bg-violet-50">
          <Phone className="h-6 w-6 text-violet-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Total de Chamadas</p>
          <p className="text-2xl font-bold text-gray-900">{totalCalls}</p>
        </div>
      </div>

      {/* Chamadas Ativas */}
      <div className="bg-white rounded-xl p-4 border flex items-center">
        <div className="p-3 rounded-full bg-green-50">
          <PhoneCall className="h-6 w-6 text-green-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Chamadas Ativas</p>
          <p className="text-2xl font-bold text-gray-900">{activeCalls}</p>
        </div>
      </div>

      {/* Chamadas Chamando */}
      <div className="bg-white rounded-xl p-4 border flex items-center">
        <div className="p-3 rounded-full bg-yellow-50">
          <Activity className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Chamando</p>
          <p className="text-2xl font-bold text-gray-900">{ringingCalls}</p>
        </div>
      </div>

      {/* Duração Média */}
      <div className="bg-white rounded-xl p-4 border flex items-center">
        <div className="p-3 rounded-full bg-blue-50">
          <Clock className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Duração Média</p>
          <p className="text-2xl font-bold text-gray-900">{Math.round(avgDuration)}s</p>
        </div>
      </div>
    </div>
  );
};
