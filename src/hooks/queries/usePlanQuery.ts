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
  console.log('Fetching plan with name:', planName);
  
  const { data, error } = await supabase
    .from('planos')
    .select('*')
    .eq('nome', planName)
    .single();

  if (error) {
    console.error('Error fetching plan data:', error);
    return null;
  }

  console.log('Plan data fetched:', data);
  return data;
}

export function usePlanQuery(planName: string | undefined) {
  console.log('usePlanQuery called with planName:', planName);
  
  return useQuery({
    queryKey: ['plan', planName],
    queryFn: () => fetchPlan(planName!),
    enabled: !!planName,
  });
}
