import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export interface UserData {
  name: string;
  email: string;
  plano?: string;
  created_at: string;
  accountid: string;
  status: string;
  role?: 'admin' | 'cliente' | 'user';
  contato?: string;
  documento?: string;
}

export function useUserDataQuery(accountId: string | undefined) {
  return useQuery({
    queryKey: ['userData', accountId],
    queryFn: async () => {
      if (!accountId) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('accountid', accountId)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
      }

      return data;
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 30, // 30 minutos
    retry: 2,
  });
}
