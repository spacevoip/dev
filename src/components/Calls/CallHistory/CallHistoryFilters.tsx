import React from 'react';
import { Search, Calendar, Save } from 'lucide-react';
import { Button } from '../../Common/Button';
import { DateRangePicker } from '../../Common/DateRangePicker';

interface CallHistoryFiltersProps {
  onSearch: (value: string) => void;
  onDateRangeChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  onFilterChange: (filters: any) => void;
  filters: {
    type: string;
    status: string;
    duration: string;
  };
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export const CallHistoryFilters: React.FC<CallHistoryFiltersProps> = ({
  onSearch,
  onDateRangeChange,
  onFilterChange,
  filters,
  searchInputRef,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Busca e Data */}
        <div className="flex-1 flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-violet-500 focus:ring-violet-500"
              placeholder="Buscar por ramal..."
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          
          <div className="w-72">
            <DateRangePicker
              onChange={onDateRangeChange}
              placeholder="Selecione o período..."
              startIcon={<Calendar className="h-5 w-5 text-gray-400" />}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <select
            className="block w-40 py-2.5 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-violet-500 focus:ring-violet-500"
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
          >
            <option value="all">Todas</option>
            <option value="inbound">Entrada</option>
            <option value="outbound">Saída</option>
          </select>

          <select
            className="block w-40 py-2.5 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-violet-500 focus:ring-violet-500"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="ANSWERED">Atendida</option>
            <option value="NO ANSWER">Não Atendida</option>
            <option value="BUSY">Ocupado</option>
            <option value="FAILED">Falha</option>
          </select>

          <select
            className="block w-40 py-2.5 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-violet-500 focus:ring-violet-500"
            value={filters.duration}
            onChange={(e) => onFilterChange({ ...filters, duration: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="0-30">0 - 30s</option>
            <option value="31-60">31s - 1min</option>
            <option value="61-300">1min - 5min</option>
            <option value="300+">+5min</option>
          </select>
        </div>
      </div>

      {/* Botão Salvar */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {}}
          className="text-gray-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Filtro
        </Button>
      </div>
    </div>
  );
};
