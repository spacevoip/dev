import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface Extension {
  id: string;
  extension: string;
  name: string;
  status: string;
  callerid: string;
}

export const useExtensions = () => {
  const { user } = useAuth();
  const accountId = user?.accountid;

  return useQuery({
    queryKey: ['extensions', accountId],
    queryFn: async (): Promise<Extension[]> => {
      if (!accountId) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('extensions')
          .select('*')
          .eq('accountid', accountId);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Erro ao buscar ramais:', error);
        return [];
      }
    },
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
};
