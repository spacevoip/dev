import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useActiveCallsCount = (accountcode?: string) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('activecalls')
          .select('*', { count: 'exact', head: true });

        // Se tiver accountcode, filtra por ele
        if (accountcode) {
          query = query.eq('accountcode', accountcode);
        }

        const { count: activeCallsCount, error: countError } = await query;

        if (countError) throw countError;

        setCount(activeCallsCount || 0);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar contagem de chamadas ativas:', err);
        setError('Falha ao carregar chamadas ativas');
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    // Busca inicial
    fetchCount();

    // Inscreve-se nas mudanças da tabela
    const subscription = supabase
      .channel('activecalls_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'activecalls',
          filter: accountcode ? `accountcode=eq.${accountcode}` : undefined
        }, 
        () => {
          // Atualiza a contagem quando houver mudanças
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [accountcode]);

  return { count, loading, error };
};
