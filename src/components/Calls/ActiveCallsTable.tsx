import React, { useState } from 'react';
import { useActiveCalls } from '../../hooks/useActiveCalls';
import { useAuth } from '../../contexts/AuthContext';
import { PhoneXMarkIcon } from '@heroicons/react/24/outline';
import { PhoneIcon } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import type { ActiveCall } from '../../types';

interface ActiveCallsTableProps {
  calls: ActiveCall[];
}

const ActiveCallsTable: React.FC<ActiveCallsTableProps> = ({ calls }) => {
  const { refetch } = useActiveCalls();
  const { user } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const handleHangupClick = (channel: string) => {
    setSelectedChannel(channel);
    setIsConfirmOpen(true);
  };

  const handleHangupConfirm = async () => {
    if (!selectedChannel) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) throw new Error('API URL não configurada');
      
      const apiUrl = API_URL.startsWith('https://') ? API_URL : `https://${API_URL}`;
      const response = await fetch(`${apiUrl}/hangup-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          channel: selectedChannel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Erro ao desligar chamada');
      }

      await refetch();
    } catch (error) {
      console.error('Erro ao desligar chamada:', error);
      alert('Erro ao desligar chamada. Por favor, tente novamente.');
    } finally {
      setIsConfirmOpen(false);
      setSelectedChannel(null);
    }
  };

  if (!calls.length) {
    return (
      <div className="text-center py-12">
        <PhoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma chamada ativa</h3>
        <p className="text-gray-500">Não há chamadas em andamento no momento.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ramal
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Caller ID
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Destino
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Duração
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {calls.map((call) => (
              <tr 
                key={call.channel}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-2 rounded-lg">
                      <PhoneIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{call.ramal}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{call.callerid}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{call.destino}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{call.duracao}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    call.status === 'Chamando' 
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {call.status === 'Chamando' ? (
                      <>
                        <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse mr-1.5"></span>
                        {call.status}
                      </>
                    ) : (
                      <>
                        <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5"></span>
                        {call.status}
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {call.status === 'Falando' && (
                    <button
                      onClick={() => handleHangupClick(call.channel)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title="Encerrar chamada"
                    >
                      <PhoneXMarkIcon className="h-4 w-4" />
                      Encerrar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Confirmar encerramento
            </Dialog.Title>

            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Tem certeza que deseja encerrar esta chamada?
              </p>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                onClick={handleHangupConfirm}
              >
                Encerrar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default ActiveCallsTable;
