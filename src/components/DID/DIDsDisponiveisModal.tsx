import React, { useCallback, useEffect } from 'react';
import { X, Phone, PhoneCall } from 'lucide-react';
import { useDIDsDisponiveis } from '../../hooks/useDIDsDisponiveis';
import { formatCurrency } from '../../utils/format';

interface DIDsDisponiveisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (did: string) => void;
}

export const DIDsDisponiveisModal: React.FC<DIDsDisponiveisModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { dids, loading, error } = useDIDsDisponiveis();

  // Handler para fechar o modal quando pressionar ESC
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handler para fechar o modal quando clicar fora
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Adiciona e remove os event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, handleEscapeKey]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-xl">
              <PhoneCall className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Números Disponíveis para Ativação</h3>
              <p className="text-sm text-gray-500 mt-1">
                Selecione um número para ativar em sua conta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-violet-100 border-t-violet-600 mx-auto"></div>
              <p className="text-gray-500 mt-4 text-sm">Carregando números disponíveis...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : dids.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium text-lg mb-2">No Momento estamos sem Numeração</p>
              <p className="text-gray-500 text-sm">
                Não há números disponíveis para ativação no momento. Tente novamente mais tarde.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Número</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Chamadas Simultâneas</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Valor</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dids.map((did) => (
                    <tr key={did.numero} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                            <Phone className="h-5 w-5 text-violet-600" />
                          </div>
                          <span className="font-medium text-gray-900">{did.numero}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium">
                            {did.simultaneas}
                          </div>
                          <span className="text-gray-500 text-sm">chamadas</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{formatCurrency(did.valor)}</span>
                          <span className="text-xs text-gray-500">por mês</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => onSelect(did.numero)}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Ativar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
