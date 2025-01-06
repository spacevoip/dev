import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export interface Plan {
  id: string;
  nome: string;
  description: string;
  price: number;
  features: string[];
  validade: number;
  limite: number;
}

async function fetchPlan(planName: string): Promise<Plan | null> {
  const { data, error } = await supabase
    .from('planos')
    .select('*')
    .eq('nome', planName)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export function usePlanQuery(planName: string | undefined) {
  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan', planName],
    queryFn: async () => {
      if (!planName) return null;

      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('name', planName)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!planName,
  });

  return { data: plan, isLoading };
}
