import React, { useState } from 'react';
import { CallHistoryItem } from './CallHistoryItem';
import { Skeleton } from '../../Common/Skeleton';
import type { CallHistory } from '../../../types';
import { ArrowUpDown, HelpCircle, Trash2 } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useDeleteCalls } from '../../../hooks/useDeleteCalls';
import toast from 'react-hot-toast';

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
  onDeleteCalls: (ids: string[]) => void;
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

export function CallHistoryList({ calls, loading, error, onSort, sortBy, selectedCalls, onSelectCall, onSelectAllCalls }: CallHistoryListProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteMutation = useDeleteCalls();

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(selectedCalls);
      setIsDeleteModalOpen(false);
      onSelectAllCalls(false); // Limpa a seleção
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

      {/* Tabela */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    checked={allSelected}
                    ref={checkbox => {
                      if (checkbox) {
                        checkbox.indeterminate = someSelected;
                      }
                    }}
                    onChange={(e) => onSelectAllCalls(e.target.checked)}
                  />
                </th>
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
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-12" />
                    </td>
                  </tr>
                ))
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <CallHistoryItem
                    key={call.id}
                    call={call}
                    selected={selectedCalls.includes(call.id)}
                    onSelect={() => onSelectCall(call.id)}
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
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Confirmar Exclusão
            </Dialog.Title>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Tem certeza que deseja excluir {selectedCalls.length} {selectedCalls.length === 1 ? 'registro' : 'registros'} do histórico?
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Excluir
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};