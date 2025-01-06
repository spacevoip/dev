import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface PlanPrice {
  id: string;
  valor: number;
}

// Mapeamento correto dos IDs do banco para IDs do frontend
const ID_MAPPING: Record<string, string> = {
  '7085ca32-b4d0-4f5b-86e3-5b03ba629eb4': 'trial',     // Sip Trial
  '4dda5130-e5c6-44c4-bbf4-4d1201408da4': 'basic',     // Sip Básico
  '03e04ea3-06db-4660-830d-0de28a14dff5': 'premium',   // Sip Premium
  '7d3c0e5a-707e-4c2e-ac4e-58a4fc0aa1b1': 'exclusive'  // Sip Exclusive
};

export const usePlanPrices = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('planos')
          .select('id, valor');

        if (error) {
          return;
        }

        if (data) {
          const priceMap = data.reduce((acc: Record<string, number>, plan: PlanPrice) => {
            const frontendId = ID_MAPPING[plan.id];
            if (frontendId) {
              acc[frontendId] = plan.valor;
            } else {
              console.log('ID não encontrado no mapeamento:', plan.id);
            }
            return acc;
          }, {});
          
          setPrices(priceMap);
        }
      } catch (err) {
        console.error('Erro ao buscar preços dos planos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

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
          fetchPrices();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { prices, loading };
};
