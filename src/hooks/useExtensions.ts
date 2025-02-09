import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface Extension {
  id: string;
  extension: string;
  nome: string;
  status: string;
  callerid: string;
  snystatus?: string;
  numero: string;
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
          .eq('accountid', accountId)
          .order('numero');

        if (error) throw error;

        // Transforma os dados para o formato esperado
        return (data || []).map(ext => ({
          id: ext.id || '',
          extension: ext.numero || '',
          nome: ext.nome || '',
          status: ext.snystatus || 'offline',
          callerid: ext.callerid || '',
          snystatus: ext.snystatus,
          numero: ext.numero
        }));
      } catch (error) {
        console.error('Erro ao buscar ramais:', error);
        return [];
      }
    },
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
};
