import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UseExtensionsCountOptions {
  staleTime?: number;
}

export function useExtensionsCount(options: UseExtensionsCountOptions = {}) {
  const { user } = useAuth();
  const accountId = user?.accountid;

  const { data: planLimit = 0 } = useQuery({
    queryKey: ['planLimit', accountId],
    queryFn: async () => {
      if (!accountId) return 0;

      const { data: plan, error } = await supabase
        .from('planos')
        .select('limite')
        .eq('nome', (await supabase
          .from('users')
          .select('plano')
          .eq('accountid', accountId)
          .single()).data.plano)
        .single();

      if (error) {
        console.error('Erro ao buscar limite do plano:', error);
        return 0;
      }

      return plan?.limite || 0;
    },
    enabled: !!accountId,
    staleTime: options.staleTime,
  });

  const { data: currentCount = 0, isLoading } = useQuery({
    queryKey: ['extensionsCount', accountId],
    queryFn: async () => {
      if (!accountId) return 0;

      const { count, error } = await supabase
        .from('extensions')
        .select('*', { count: 'exact', head: true })
        .eq('accountid', accountId);

      if (error) {
        console.error('Erro ao buscar total de ramais:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!accountId,
    staleTime: options.staleTime,
  });

  return {
    currentCount,
    planLimit,
    loading: isLoading,
  };
}
