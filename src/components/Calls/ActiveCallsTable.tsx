import React, { useState } from 'react';
import { useActiveCalls } from '../../hooks/useActiveCalls';
import { useAuth } from '../../contexts/AuthContext';
import { PhoneXMarkIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';

export function ActiveCallsTable() {
  const { data: calls = [], isLoading, error } = useActiveCalls();
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
      console.log('Desligando chamada:', selectedChannel); // Debug
      const response = await fetch('https://91.108.125.149:5000/hangup-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: selectedChannel,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao desligar chamada');
      }

      console.log('Chamada desligada com sucesso');
    } catch (error) {
      console.error('Erro ao desligar chamada:', error);
    } finally {
      setIsConfirmOpen(false);
      setSelectedChannel(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Carregando chamadas...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Erro ao carregar chamadas</div>;
  }

  if (!calls.length) {
    return <div className="text-center py-4">Nenhuma chamada ativa no momento</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ramal
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Caller ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duração
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calls.map((call) => (
              <tr key={call.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.ramal}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.callerid}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.duracao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.status === 'Falando' && (
                    <button
                      onClick={() => handleHangupClick(call.channel)}
                      className="text-red-600 hover:text-red-900"
                      title="Encerrar chamada"
                    >
                      <PhoneXMarkIcon className="h-5 w-5" />
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
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded max-w-sm mx-auto p-6">
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
          </div>
        </div>
      </Dialog>
    </>
  );
}
