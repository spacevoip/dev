import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UseTotalCallsOptions {
  staleTime?: number;
}

export function useTotalCalls(options: UseTotalCallsOptions = {}) {
  const { user } = useAuth();
  const accountId = user?.accountid;

  return useQuery({
    queryKey: ['totalCalls', accountId],
    queryFn: async () => {
      if (!accountId) {
        return 0;
      }

      const { count, error } = await supabase
        .from('cdr')
        .select('*', { count: 'exact', head: true })
        .eq('accountid', accountId);

      if (error) {
        console.error('Erro ao buscar total de chamadas:', error);
        return 0;
      }

      return count || 0;
    },
    refetchInterval: 5000,
    enabled: !!accountId,
    staleTime: options.staleTime,
  });
}
