import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface PlanData {
  id: string;
  valor: number;
  validade: string;
  limite: number;
}

interface PlanInfo {
  price: number;
  validity: string;
  limit: number;
}

// Mapeamento correto dos IDs do banco para IDs do frontend
const ID_MAPPING: Record<string, string> = {
  '7085ca32-b4d0-4f5b-86e3-5b03ba629eb4': 'trial',     // Sip Trial
  '4dda5130-e5c6-44c4-bbf4-4d1201408da4': 'basic',     // Sip Básico
  '03e04ea3-06db-4660-830d-0de28a14dff5': 'premium',   // Sip Premium
  '7d3c0e5a-707e-4c2e-ac4e-58a4fc0aa1b1': 'exclusive'  // Sip Exclusive
};

export const usePlanPrices = () => {
  const [planInfo, setPlanInfo] = useState<Record<string, PlanInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('planos')
          .select('id, valor, validade, limite');

        if (error) {
          console.error('Erro ao buscar informações dos planos:', error);
          return;
        }

        if (data) {
          const infoMap = data.reduce((acc: Record<string, PlanInfo>, plan: PlanData) => {
            const frontendId = ID_MAPPING[plan.id];
            if (frontendId) {
              acc[frontendId] = {
                price: plan.valor,
                validity: plan.validade,
                limit: plan.limite
              };
            } else {
              console.log('ID não encontrado no mapeamento:', plan.id);
            }
            return acc;
          }, {});
          
          setPlanInfo(infoMap);
        }
      } catch (err) {
        console.error('Erro ao buscar informações dos planos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanInfo();

    const subscription = supabase
      .channel('planos_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'planos'
        }, 
        (payload) => {
          console.log('Mudança detectada:', payload);
          fetchPlanInfo();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    planInfo,
    loading,
    // Mantém a compatibilidade com o código existente
    prices: Object.entries(planInfo).reduce((acc: Record<string, number>, [key, value]) => {
      acc[key] = value.price;
      return acc;
    }, {})
  };
};
