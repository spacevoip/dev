import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PlanBadgeProps {
  planId: string;
}

interface Plan {
  id: string;
  name: string;
  status: string;
  amount: number;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ planId }) => {
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data, error } = await supabase
          .from('plansreseller')
          .select('id, name, status, amount')
          .eq('id', planId)
          .single();

        if (error) throw error;
        setPlan(data);
      } catch (error) {
        console.error('Error fetching plan:', error);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  if (!plan) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Package size={12} className="mr-1" />
        Plano não encontrado
      </span>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
        <Package size={12} className="mr-1" />
        {plan.name}
      </span>
      <span className="text-xs text-gray-500">
        {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(plan.amount)}
      </span>
    </div>
  );
};
