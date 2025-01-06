import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useTotalCalls() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['totalCalls', user?.accountid],
    queryFn: async () => {
      if (!user?.accountid) {
        return 0;
      }

      const { count, error } = await supabase
        .from('cdr')
        .select('*', { count: 'exact', head: true })
        .eq('accountid', user.accountid);

      if (error) {
        console.error('Erro ao buscar total de chamadas:', error);
        return 0;
      }

      return count || 0;
    },
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
}
