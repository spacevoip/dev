import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useDeleteCalls() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const accountId = user?.accountid;

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!accountId || !ids.length) {
        throw new Error('Dados inválidos para deleção');
      }

      // Deletar da tabela cdr2
      const { error: error2 } = await supabase
        .from('cdr2')
        .delete()
        .eq('accountcode', accountId)
        .in('uniqueid', ids);

      if (error2) {
        console.error('Erro ao deletar registros da cdr2:', error2);
        throw error2;
      }

      // Deletar da tabela cdr original
      const { error } = await supabase
        .from('cdr')
        .delete()
        .eq('accountid', accountId)
        .in('uniqueid', ids);

      if (error) {
        console.error('Erro ao deletar registros da cdr:', error);
        throw error;
      }

      return ids;
    },
    onSuccess: () => {
      // Invalida o cache para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['callHistory'] });
    },
  });
}
