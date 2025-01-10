import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { PlansTable } from '../../components/Reseller/Plans/PlansTable';
import { PlanForm } from '../../components/Reseller/Plans/PlanForm';
import { useAuth } from '../../contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  extensions: number;
  features: string[];
  active: boolean;
  reseller_id: string;
}

export const ResellerPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('reseller_id', user?.id)
        .order('price', { ascending: true });

      if (error) throw error;

      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const handleCreatePlan = async (planData: Omit<Plan, 'id' | 'reseller_id'>) => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .insert([{ ...planData, reseller_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      setPlans(prev => [...prev, data]);
      setShowForm(false);
      toast.success('Plano criado com sucesso');
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Erro ao criar plano');
    }
  };

  const handleUpdatePlan = async (planData: Omit<Plan, 'id' | 'reseller_id'>) => {
    if (!selectedPlan) return;

    try {
      const { data, error } = await supabase
        .from('plans')
        .update(planData)
        .eq('id', selectedPlan.id)
        .select()
        .single();

      if (error) throw error;

      setPlans(prev => prev.map(p => p.id === selectedPlan.id ? data : p));
      setSelectedPlan(null);
      setShowForm(false);
      toast.success('Plano atualizado com sucesso');
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Erro ao atualizar plano');
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', plan.id);

      if (error) throw error;

      setPlans(prev => prev.filter(p => p.id !== plan.id));
      toast.success('Plano excluído com sucesso');
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Erro ao excluir plano');
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .update({ active: !plan.active })
        .eq('id', plan.id)
        .select()
        .single();

      if (error) throw error;

      setPlans(prev => prev.map(p => p.id === plan.id ? data : p));
      toast.success(`Plano ${data.active ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast.error('Erro ao alterar status do plano');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
          <p className="text-gray-500 mt-1">Gerencie seus planos de assinatura</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setSelectedPlan(null);
              setShowForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Plano</span>
          </button>
        </div>
      </div>

      {/* Plans Table */}
      <PlansTable
        plans={plans}
        onEdit={(plan) => {
          setSelectedPlan(plan);
          setShowForm(true);
        }}
        onDelete={handleDeletePlan}
        onToggleActive={handleToggleActive}
      />

      {/* Plan Form Modal */}
      {showForm && (
        <PlanForm
          plan={selectedPlan || undefined}
          onSubmit={selectedPlan ? handleUpdatePlan : handleCreatePlan}
          onClose={() => {
            setShowForm(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
};
