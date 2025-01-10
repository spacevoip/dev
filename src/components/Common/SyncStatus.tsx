import React from 'react';
import { RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useBackgroundSync } from '../../hooks/useBackgroundSync';

export const SyncStatus: React.FC = () => {
  const { syncStatus, lastUpdate, isFullySynced } = useBackgroundSync();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-3">
        {isFullySynced ? (
          <>
            <Check className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600">Sincronizado</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-600">Sincronizando...</span>
          </>
        )}
        
        {/* Status detalhado em tooltip */}
        <div className="group relative">
          <button className="p-1 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <AlertTriangle className="h-4 w-4 text-gray-400" />
          </button>
          
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${syncStatus.calls ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Chamadas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${syncStatus.extensions ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Ramais</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${syncStatus.queues ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Filas</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Última atualização: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
