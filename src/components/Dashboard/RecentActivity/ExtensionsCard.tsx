import React from 'react';
import { Phone, User } from 'lucide-react';
import { useSupabaseQuery } from '../../../hooks/useSupabaseQuery';
import { useExtensionStatus } from '../../../hooks/useExtensionStatus';
import { Extension } from '../../../types/extension';

export const ExtensionsCard = () => {
  const { extensionStatuses } = useExtensionStatus();
  const { data: extensions, loading } = useSupabaseQuery<Extension>('extensions', {
    additionalFilters: (query) => query.eq('status', 'ativo'),
  });

  // Formata os dados com o status atual
  const formattedExtensions = extensions?.map(ext => ({
    ...ext,
    status: extensionStatuses[ext.numero] || 'unknown',
  })) || [];

  // Pegando apenas os 4 primeiros ramais
  const recentExtensions = formattedExtensions.slice(0, 4);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'unknown') {
      return 'bg-gray-500';
    }
    if (statusLower === 'online (livre)') {
      return 'bg-green-500';
    }
    if (statusLower === 'offline') {
      return 'bg-gray-500';
    }
    if (statusLower === 'em chamada') {
      return 'bg-orange-500';
    }
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Phone className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Ramais</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Carregando ramais...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Phone className="w-5 h-5 text-violet-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Ramais</h2>
        </div>
      </div>

      <div className="space-y-4">
        {recentExtensions.map((extension) => (
          <div
            key={extension.id}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <User className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{extension.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Ramal:</span>
                  <span className="font-medium text-gray-700">{extension.numero}</span>
                  {extension.description && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>{extension.description}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(extension.status)}`} />
                <span className="text-sm font-medium text-gray-600">
                  {extension.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{extension.callerid}</p>
            </div>
          </div>
        ))}

        {recentExtensions.length === 0 && !loading && (
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhum ramal encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};
