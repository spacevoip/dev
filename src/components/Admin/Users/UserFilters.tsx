import React, { useState, useEffect } from 'react';
import { Search, Filter, X, AlertTriangle } from 'lucide-react';
import { AdminUser } from '../../../pages/admin/Users';
import { supabase } from '../../../lib/supabase';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
  users: AdminUser[];
  onExpiredFilter: (expired: boolean) => void;
}

interface Plan {
  id: number;
  nome: string;
  validade: number;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedPlan,
  onPlanChange,
  users,
  onExpiredFilter
}) => {
  const [showExpired, setShowExpired] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Get unique plans from users
  const plans = Array.from(new Set(users.map(user => user.plano))).filter(Boolean);

  useEffect(() => {
    const fetchExpiredCount = async () => {
      try {
        const { data: plans, error: plansError } = await supabase
          .from('planos')
          .select('*');

        if (plansError) throw plansError;

        // Data atual para comparação (apenas data, sem hora)
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const expired = users.filter(user => {
          if (!user.status || user.status !== 'ativo') return false;
          if (!user.created_at || !user.plano) return false;

          const userPlan = plans?.find(p => p.nome === user.plano);
          if (!userPlan || !userPlan.validade) return false;

          // Calcular data de vencimento (apenas data, sem hora)
          const createdAt = new Date(user.created_at);
          createdAt.setHours(0, 0, 0, 0);
          
          const validityDays = parseInt(String(userPlan.validade));
          const expirationDate = new Date(createdAt);
          expirationDate.setDate(createdAt.getDate() + validityDays);
          expirationDate.setHours(0, 0, 0, 0);

          console.log('Datas calculadas (filtro):', {
            usuario: user.name,
            criacao: createdAt.toISOString(),
            validade: validityDays + ' dias',
            vencimento: expirationDate.toISOString(),
            agora: now.toISOString()
          });

          // Retorna true se estiver vencido (comparação apenas da data)
          return now > expirationDate;
        }).length;

        console.log('Total de usuários vencidos (filtro):', expired);
        setExpiredCount(expired);
      } catch (error) {
        console.error('Erro ao buscar usuários vencidos:', error);
        setExpiredCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (users.length > 0) {
      fetchExpiredCount();
    } else {
      setExpiredCount(0);
      setIsLoading(false);
    }
  }, [users]);

  const handleExpiredToggle = () => {
    const newValue = !showExpired;
    setShowExpired(newValue);
    onExpiredFilter(newValue);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou documento..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[150px]">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>

          <div className="min-w-[150px]">
            <select
              value={selectedPlan}
              onChange={(e) => onPlanChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Plano</option>
              {plans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExpiredToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showExpired
                ? 'bg-orange-50 border-orange-200 text-orange-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${showExpired ? 'text-orange-500' : 'text-gray-400'}`} />
            <span className="whitespace-nowrap">
              Planos Vencidos
              {!isLoading && expiredCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                  {expiredCount}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
