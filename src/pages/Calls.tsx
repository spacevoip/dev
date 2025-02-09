import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ActiveCallsTable from '../components/Calls/ActiveCallsTable';
import { CallsStats } from '../components/Calls/CallsStats';
import { CallsFilters } from '../components/Calls/CallsFilters';
import { useActiveCalls } from '../hooks/useActiveCalls';
import { RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Calls = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    data: calls = [], 
    isLoading: callsLoading, 
    error, 
    refetch,
    isFetching 
  } = useActiveCalls();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Atualizar timestamp do último refresh quando os dados são atualizados
  useEffect(() => {
    if (!isFetching) {
      setLastRefresh(Date.now());
    }
  }, [isFetching]);

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
    if (isManualRefreshing) return;
    
    setIsManualRefreshing(true);
    setRefreshError(null);
    
    try {
      await refetch();
    } catch (err) {
      setRefreshError('Erro ao atualizar dados. Tente novamente.');
      console.error('Erro no refresh manual:', err);
    }

    // Garante que o spinner gire por pelo menos 500ms
    setTimeout(() => {
      setIsManualRefreshing(false);
    }, 500);
  }, [refetch, isManualRefreshing]);

  // Calcular tempo desde último refresh
  const getRefreshTime = () => {
    const seconds = Math.floor((Date.now() - lastRefresh) / 1000);
    if (seconds < 60) {
      return `${seconds}s atrás`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m atrás`;
  };

  // Mostra loading enquanto carrega autenticação
  if (authLoading) {
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Última atualização: {getRefreshTime()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isManualRefreshing || isFetching}
            className={`inline-flex items-center justify-center p-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
              isManualRefreshing || isFetching ? 'cursor-not-allowed opacity-70' : ''
            }`}
            title="Atualizar"
          >
            <RefreshCw className={`h-5 w-5 transition-all duration-200 ${
              isManualRefreshing || isFetching ? 'animate-spin' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {(error || refreshError) && (
        <Alert variant="destructive">
          <AlertDescription>
            {refreshError || 'Erro ao carregar chamadas. Os dados podem estar desatualizados.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Estatísticas */}
      <CallsStats calls={calls} />

      {/* Filtros */}
      <CallsFilters
        onSearch={setSearchQuery}
        onStatusFilter={setStatusFilter}
        selectedStatus={statusFilter}
      />

      {/* Tabela de Chamadas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        {callsLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        )}
        <div className="p-6">
          <ActiveCallsTable calls={filteredCalls} />
        </div>
      </div>

      {/* Rodapé com Informações */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Os dados são atualizados automaticamente a cada 5 segundos.
          {isFetching && ' (Atualizando...)'}
        </p>
      </div>
    </div>
  );
};