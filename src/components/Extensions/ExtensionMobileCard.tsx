import React from 'react';
import { ExtensionStats } from '../../types/extension';

interface ExtensionMobileCardProps {
  stat: ExtensionStats;
  formatDuration: (seconds: number) => string;
}

export const ExtensionMobileCard: React.FC<ExtensionMobileCardProps> = ({ stat, formatDuration }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Ramal {stat.extension}</h3>
          <p className={`text-sm ${stat.agentName === 'Ramal Já Excluído' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            {stat.agentName}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`text-xs px-2 py-1 rounded-full text-center ${
            stat.sipStatus === 'Online (Livre)' ? 'bg-green-100 text-green-800' :
            stat.sipStatus === 'Offline' ? 'bg-red-100 text-red-800' :
            stat.sipStatus === 'Em Chamada' ? 'bg-orange-100 text-orange-800' :
            stat.sipStatus === 'Falando' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {stat.sipStatus}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full text-center ${
            stat.panelStatus === 'Disponível' ? 'bg-green-100 text-green-800' :
            stat.panelStatus === 'Pausa' ? 'bg-yellow-100 text-yellow-800' :
            stat.panelStatus === 'Em Atendimento' ? 'bg-blue-100 text-blue-800' :
            stat.panelStatus === 'Indisponível' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {stat.panelStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Chamadas Atendidas</p>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium text-gray-900">{stat.answeredCalls}</span>
            <span className={`text-xs ${stat.performanceComparison > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              ({Math.round(stat.performanceComparison)}%)
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Taxa de Atendimento</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${Math.round(stat.successRate)}%` }}
              />
            </div>
            <span className="text-sm text-gray-900">{Math.round(stat.successRate)}%</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Chamadas Discadas</p>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium text-gray-900">{stat.outboundCalls}</span>
            <span className={`text-xs ${stat.outboundComparison > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              ({Math.round(stat.outboundComparison)}%)
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Duração Média</p>
          <p className="text-lg font-medium text-gray-900">
            {formatDuration(Math.round(stat.averageDuration))}
          </p>
        </div>
      </div>
    </div>
  );
};
