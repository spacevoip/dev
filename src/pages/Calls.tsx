import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ActiveCallsTable from '../components/Calls/ActiveCallsTable';
import { CallsStats } from '../components/Calls/CallsStats';
import { CallsFilters } from '../components/Calls/CallsFilters';
import { useActiveCalls } from '../hooks/useActiveCalls';
import { RefreshCw } from 'lucide-react';

export const Calls = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: calls = [], isLoading: callsLoading, error, refetch } = useActiveCalls();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtrar chamadas
  const filteredCalls = calls.filter(call => {
    const matchesSearch = searchQuery 
      ? (call.ramal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         call.destino?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesStatus = statusFilter
      ? call.status === statusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  // Atualizar com efeito de rotação
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setLastRefresh(Date.now());
    // Aguarda um pouco para o efeito ser visível
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [refetch]);

  // Calcular tempo desde último refresh
  const getRefreshTime = () => {
    const seconds = Math.floor((Date.now() - lastRefresh) / 1000);
    return `${seconds}s atrás`;
  };

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
      {/* Header com Título e Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Chamadas em Andamento</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualize e gerencie todas as chamadas ativas no momento
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`inline-flex items-center justify-center p-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          title="Atualizar"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <CallsStats calls={calls} />

      {/* Filtros */}
      <CallsFilters
        onSearch={setSearchQuery}
        onStatusFilter={setStatusFilter}
        selectedStatus={statusFilter}
      />

      {/* Tabela de Chamadas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <ActiveCallsTable calls={filteredCalls} />
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