import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Plan {
  id: string;
  nome: string;
  valor: number;
  descricao: string;
  ramais: number;
  created_at?: string;
}

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('planos')
          .select('*')
          .order('ramais', { ascending: true });

        if (fetchError) throw fetchError;

        setPlans(data || []);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar planos:', err);
        setError('Falha ao carregar planos');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();

    // Inscreve-se nas mudanças da tabela
    const subscription = supabase
      .channel('planos_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'planos'
        }, 
        () => {
          // Atualiza os planos quando houver mudanças
          fetchPlans();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { plans, loading, error };
};
