import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DIDCliente } from '../types/didClientes';
import { useAuth } from '../contexts/AuthContext';

export function useDIDsCliente() {
  const { accountId } = useAuth();

  return useQuery({
    queryKey: ['dids', accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('didclientes')
        .select('*')
        .eq('accountid', accountId);

      if (error) {
        throw new Error('Erro ao buscar DIDs');
      }

      return data as DIDCliente[];
    },
    enabled: !!accountId,
  });
}
