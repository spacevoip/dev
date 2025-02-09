import React, { useState } from 'react';
import { CallHistoryItem } from './CallHistoryItem';
import { Skeleton } from '../../Common/Skeleton';
import type { CallHistory } from '../../../types';
import { ArrowUpDown, HelpCircle, Trash2, Phone, Calendar, Clock } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useDeleteCalls } from '../../../hooks/useDeleteCalls';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface CallHistoryListProps {
  calls: CallHistory[];
  loading: boolean;
  error: string | null;
  onSort?: (column: string) => void;
  sortBy?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  selectedCalls: string[];
  onSelectCall: (id: string) => void;
  onSelectAllCalls: (selected: boolean) => void;
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

// Card para visualização mobile
const CallHistoryCard: React.FC<{
  call: CallHistory;
  selected: boolean;
  onSelect: (id: string) => void;
}> = ({ call, selected, onSelect }) => (
  <div className={`bg-white rounded-lg shadow-sm p-4 ${selected ? 'ring-2 ring-violet-500' : ''}`}>
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(call.id)}
          className="h-4 w-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
        />
        <div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">{call.from}</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium text-gray-900">{call.to}</span>
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(call.timestamp), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{call.formattedDuration}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        call.status === 'Atendida' ? 'bg-green-50 text-green-700' :
        call.status === 'Não Atendida' ? 'bg-yellow-50 text-yellow-700' :
        call.status === 'Ocupado' ? 'bg-orange-50 text-orange-700' :
        'bg-red-50 text-red-700'
      }`}>
        {call.status}
      </div>
    </div>
  </div>
);

export function CallHistoryList({ calls, loading, error, onSort, sortBy, selectedCalls, onSelectCall, onSelectAllCalls }: CallHistoryListProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteMutation = useDeleteCalls();

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(selectedCalls);
      setIsDeleteModalOpen(false);
      onSelectAllCalls(false);
      toast.success(`${selectedCalls.length} ${selectedCalls.length === 1 ? 'registro excluído' : 'registros excluídos'} com sucesso`);
    } catch (error) {
      console.error('Erro ao excluir registros:', error);
      toast.error('Erro ao excluir registros');
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
        {error}
      </div>
    );
  }

  const allSelected = calls.length > 0 && selectedCalls.length === calls.length;
  const someSelected = selectedCalls.length > 0 && selectedCalls.length < calls.length;

  return (
    <div className="space-y-4">
      {/* Barra de ações */}
      {selectedCalls.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedCalls.length} {selectedCalls.length === 1 ? 'item selecionado' : 'itens selecionados'}
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Deletar Selecionados</span>
          </button>
        </div>
      )}

      {/* Lista Mobile */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4">
              <Skeleton className="h-16" />
            </div>
          ))
        ) : (
          calls.map(call => (
            <CallHistoryCard
              key={call.id}
              call={call}
              selected={selectedCalls.includes(call.id)}
              onSelect={onSelectCall}
            />
          ))
        )}
      </div>

      {/* Tabela Desktop */}
      <div className="hidden lg:block bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => input && (input.indeterminate = someSelected)}
                    onChange={(e) => onSelectAllCalls(e.target.checked)}
                    className="h-4 w-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
                  />
                </th>
                <SortableHeader column="start" label="Data" currentSort={sortBy} onSort={onSort} />
                <SortableHeader column="from" label="De" currentSort={sortBy} onSort={onSort} />
                <SortableHeader column="to" label="Para" currentSort={sortBy} onSort={onSort} />
                <SortableHeader column="duration" label="Duração" currentSort={sortBy} onSort={onSort} />
                <SortableHeader column="status" label="Status" currentSort={sortBy} onSort={onSort} />
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-8" />
                    </td>
                  </tr>
                ))
              ) : (
                calls.map(call => (
                  <CallHistoryItem
                    key={call.id}
                    call={call}
                    selected={selectedCalls.includes(call.id)}
                    onSelect={onSelectCall}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Confirmar Exclusão
            </Dialog.Title>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Tem certeza que deseja excluir {selectedCalls.length} {selectedCalls.length === 1 ? 'registro' : 'registros'}? Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleDeleteConfirm}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}