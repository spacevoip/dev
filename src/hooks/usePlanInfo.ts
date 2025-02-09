import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface PlanInfo {
  nome: string;
  limite: number;
  validade: number;
  descricao?: string;
}

export function usePlanInfo(planoNome: string | undefined) {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanInfo() {
      if (!planoNome) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('planos')
          .select('*')
          .eq('nome', planoNome)
          .single();

        if (error) throw error;

        setPlanInfo(data);
      } catch (err) {
        console.error('Erro ao buscar informações do plano:', err);
        setError('Erro ao carregar informações do plano');
      } finally {
        setLoading(false);
      }
    }

    fetchPlanInfo();
  }, [planoNome]);

  return { planInfo, loading, error };
}
