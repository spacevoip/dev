import React from 'react';
import { Phone, PhoneCall, PhoneOff, Activity } from 'lucide-react';
import { Extension } from '../../types/extension';

interface ExtensionStatsProps {
  extensions: Extension[];
  extensionStatuses: Record<string, string>;
}

export const ExtensionStats: React.FC<ExtensionStatsProps> = ({
  extensions,
  extensionStatuses,
}) => {
  const stats = React.useMemo(() => {
    const result = {
      total: extensions.length,
      online: 0,
      inCall: 0,
      offline: 0,
    };

    extensions.forEach((extension) => {
      const status = (extensionStatuses[extension.numero] || 'unknown').toLowerCase();
      
      if (status === 'online (livre)') {
        result.online++;
      } else if (status === 'em chamada') {
        result.inCall++;
      } else if (status === 'offline' || status === 'unknown') {
        result.offline++;
      }
    });

    return result;
  }, [extensions, extensionStatuses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total de Ramais */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <Phone className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Ramais</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Ramais Online (Livre) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Activity className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Online (Livre)</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.online}</p>
          </div>
        </div>
      </div>

      {/* Ramais em Chamada */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <PhoneCall className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Em Chamada</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.inCall}</p>
          </div>
        </div>
      </div>

      {/* Ramais Offline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <PhoneOff className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Offline</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.offline}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
