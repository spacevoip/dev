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

      const { error } = await supabase
        .from('cdr')
        .delete()
        .eq('accountid', accountId)
        .in('id', ids);

      if (error) {
        console.error('Erro ao deletar registros:', error);
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
