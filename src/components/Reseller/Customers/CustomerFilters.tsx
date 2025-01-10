import React from 'react';
import { Search, Filter } from 'lucide-react';

interface CustomerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPlan: string;
  onPlanChange: (value: string) => void;
  showExpired: boolean;
  onShowExpiredChange: (value: boolean) => void;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedPlan,
  onPlanChange,
  showExpired,
  onShowExpiredChange,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Busca */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nome, email ou documento..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="block pl-3 pr-8 py-2 text-base border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          <select
            value={selectedPlan}
            onChange={(e) => onPlanChange(e.target.value)}
            className="block pl-3 pr-8 py-2 text-base border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="">Plano</option>
            <option value="sip_trial">Sip Trial</option>
            <option value="sip_basico">Sip Básico</option>
            <option value="sip_premium">Sip Premium</option>
            <option value="sip_exclusive">Sip Exclusive</option>
          </select>

          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={showExpired}
              onChange={(e) => onShowExpiredChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm">Mostrar expirados</span>
          </label>
        </div>
      </div>
    </div>
  );
};
