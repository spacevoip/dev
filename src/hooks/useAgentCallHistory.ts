import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAgent } from '../contexts/AgentContext';
import type { CDRRecord } from '../types';

export function useAgentCallHistory() {
  const { agent } = useAgent();
  const accountId = agent?.accountid;
  const numero = agent?.numero;

  const query = useQuery({
    queryKey: ['agentCallHistory', accountId, numero],
    queryFn: async () => {
      if (!accountId || !numero) {
        return [];
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('cdr')
        .select('*')
        .eq('accountid', accountId)
        .like('channel', `%/${numero}-%`)
        .gte('start', today.toISOString())
        .order('start', { ascending: false })
        .limit(10); // Limitando a 10 chamadas

      if (error) {
        console.error('Erro ao buscar histórico de chamadas:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!accountId && !!numero,
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3
  });

  return {
    calls: query.data || [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    isRefetching: query.isRefetching
  };
}
