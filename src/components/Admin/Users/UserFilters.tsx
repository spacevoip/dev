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

  const plans = Array.from(new Set(users.map(user => user.plano))).filter(Boolean);

  useEffect(() => {
    const fetchExpiredCount = async () => {
      try {
        const { data: plans, error: plansError } = await supabase
          .from('planos')
          .select('*');

        if (plansError) throw plansError;

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const expired = users.filter(user => {
          if (!user.created_at || !user.plano) return false;

          const userPlan = plans?.find(p => p.nome === user.plano);
          if (!userPlan || !userPlan.validade) return false;

          const createdAt = new Date(user.created_at);
          createdAt.setHours(0, 0, 0, 0);
          
          const validityDays = parseInt(String(userPlan.validade));
          const expirationDate = new Date(createdAt);
          expirationDate.setDate(createdAt.getDate() + validityDays);
          expirationDate.setHours(23, 59, 59, 999);

          return now > expirationDate;
        }).length;

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
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome, email ou contato..."
            className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
          </div>

          {/* Plan Filter */}
          <div className="relative">
            <select
              value={selectedPlan}
              onChange={(e) => onPlanChange(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Todos os Planos</option>
              {plans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
          </div>

          {/* Expired Filter */}
          <button
            onClick={handleExpiredToggle}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              showExpired
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className={`h-4 w-4 ${showExpired ? 'text-red-500' : 'text-gray-400'}`} />
            <span>Vencidos</span>
            {!isLoading && expiredCount > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                showExpired ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {expiredCount}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {(searchTerm || selectedStatus || selectedPlan || showExpired) && (
            <button
              onClick={() => {
                onSearchChange('');
                onStatusChange('');
                onPlanChange('');
                setShowExpired(false);
                onExpiredFilter(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {(searchTerm || selectedStatus || selectedPlan || showExpired) && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
              Busca: {searchTerm}
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
              Status: {selectedStatus === 'ativo' ? 'Ativo' : 'Inativo'}
              <button
                onClick={() => onStatusChange('')}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          )}
          {selectedPlan && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
              Plano: {selectedPlan}
              <button
                onClick={() => onPlanChange('')}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          )}
          {showExpired && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              Apenas Vencidos
              <button
                onClick={handleExpiredToggle}
                className="ml-1 text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
