import React from 'react';
import { CallHistoryItem } from './CallHistoryItem';
import { Skeleton } from '../../Common/Skeleton';
import type { CallHistory } from '../../../types';
import { ArrowUpDown } from 'lucide-react';
import { HelpCircle } from 'lucide-react';

interface CallHistoryListProps {
  calls: CallHistory[];
  loading: boolean;
  error: string | null;
  onSort?: (column: string) => void;
  sortBy?: {
    column: string;
    direction: 'asc' | 'desc';
  };
}

const SortableHeader: React.FC<{
  column: string;
  label: string;
  currentSort?: { column: string; direction: 'asc' | 'desc' };
  onSort?: (column: string) => void;
}> = ({ column, label, currentSort, onSort }) => {
  const isActive = currentSort?.column === column;
  
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 ${
        isActive ? 'bg-gray-50' : ''
      }`}
      onClick={() => onSort?.(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-4 w-4 ${isActive ? 'text-violet-500' : 'text-gray-400'}`} />
      </div>
    </th>
  );
};

export const CallHistoryList: React.FC<CallHistoryListProps> = ({
  calls,
  loading,
  error,
  onSort,
  sortBy
}) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader
                column="start"
                label="Data/Hora"
                currentSort={sortBy}
                onSort={onSort}
              />
              <SortableHeader
                column="channel"
                label="De"
                currentSort={sortBy}
                onSort={onSort}
              />
              <SortableHeader
                column="dst"
                label="Para"
                currentSort={sortBy}
                onSort={onSort}
              />
              <SortableHeader
                column="billsec"
                label="Duração"
                currentSort={sortBy}
                onSort={onSort}
              />
              <SortableHeader
                column="disposition"
                label="Status"
                currentSort={sortBy}
                onSort={onSort}
              />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Gravação
                  <div className="group relative">
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                    <div className="absolute hidden group-hover:block bg-black text-white text-xs rounded p-2 min-w-[200px] -left-1/2 transform -translate-x-1/2 mt-1 z-10">
                      Somente Chamadas Acima de 10 segundos
                    </div>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </td>
                </tr>
              ))
            ) : calls.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Nenhuma chamada encontrada
                </td>
              </tr>
            ) : (
              calls.map((call) => (
                <CallHistoryItem key={call.id} call={call} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};