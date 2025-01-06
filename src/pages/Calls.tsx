import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ActiveCallsTable } from '../components/Calls/ActiveCallsTable';
import { useActiveCalls } from '../hooks/useActiveCalls';

export const Calls = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: calls = [], isLoading: callsLoading, error } = useActiveCalls();

  // Mostra loading enquanto carrega autenticação ou chamadas
  if (authLoading || callsLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
        <p className="text-gray-500 mt-2">Carregando...</p>
      </div>
    );
  }

  // Verifica se o usuário está logado
  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Por favor, faça login para ver as chamadas ativas.</p>
      </div>
    );
  }

  // Mostra erro se houver
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Erro ao carregar chamadas. Por favor, tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Seção Principal */}
      <div className="grid grid-cols-1 gap-6">
        {/* Tabela de Chamadas Ativas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Chamadas em Andamento</h2>
            <p className="text-sm text-gray-500">
              Visualize e gerencie todas as chamadas ativas no momento
            </p>
          </div>
          <div className="p-6">
            <ActiveCallsTable calls={calls} />
          </div>
        </div>
      </div>

      {/* Rodapé com Informações */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Os dados são atualizados automaticamente a cada 5 segundos.
          Em caso de problemas, tente recarregar a página.
        </p>
      </div>
    </div>
  );
};