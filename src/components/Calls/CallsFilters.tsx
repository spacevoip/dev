import React from 'react';
import { Search } from 'lucide-react';

interface CallsFiltersProps {
  onSearch: (value: string) => void;
  onStatusFilter: (status: string) => void;
  selectedStatus: string;
}

export const CallsFilters: React.FC<CallsFiltersProps> = ({
  onSearch,
  onStatusFilter,
  selectedStatus,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      {/* Busca */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-violet-500 focus:ring-violet-500"
          placeholder="Buscar por ramal ou destino..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Filtro de Status */}
      <div className="flex gap-2">
        <button
          onClick={() => onStatusFilter('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedStatus === ''
              ? 'bg-violet-100 text-violet-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => onStatusFilter('Falando')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedStatus === 'Falando'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ativas
        </button>
        <button
          onClick={() => onStatusFilter('Chamando')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedStatus === 'Chamando'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Chamando
        </button>
      </div>
    </div>
  );
};
