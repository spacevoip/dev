import React from 'react';
import { HelpCircle } from 'lucide-react';

export const CallHistoryTableHeader: React.FC = () => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Origem
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Destino
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Duração
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-1">
            Tempo Total
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400" />
              <div className="absolute hidden group-hover:block bg-black text-white text-xs rounded p-2 min-w-[200px] -left-1/2 transform -translate-x-1/2 mt-1 z-10">
                Este é o tempo Real Calculado desde iniciou a Chamada
              </div>
            </div>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-1">
            Gravação
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400" />
              <div className="absolute hidden group-hover:block bg-black text-white text-xs rounded p-2 min-w-[200px] -left-1/2 transform -translate-x-1/2 mt-1 z-10">
                Somente Chamadas Acima de 10 segundos
              </div>
            </div>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Data/Hora
        </th>
      </tr>
    </thead>
  );
};