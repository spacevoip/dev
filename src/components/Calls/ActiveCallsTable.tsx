import React, { useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import type { ActiveCall } from '../../types/activeCalls';

interface ActiveCallsTableProps {
  calls: ActiveCall[];
}

export const ActiveCallsTable: React.FC<ActiveCallsTableProps> = ({ calls }) => {
  const [selectedCall, setSelectedCall] = useState<ActiveCall | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleHangupCall = async (channel: string) => {
    try {
      console.log('Desligando chamada:', channel); // Debug
      const response = await fetch('https://91.108.125.149:5000/hangup-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel }), // Mudando para lowercase para corresponder à API
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao desligar chamada');
      }

      setShowConfirmModal(false);
    } catch (error) {
      console.error('Erro ao desligar chamada:', error);
      alert('Erro ao desligar chamada. Por favor, tente novamente.');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ramal</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Origem</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Destino</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Duração</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <Phone className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    Nenhuma chamada ativa no momento
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="font-medium text-gray-900">{call.ramal}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{call.callerid}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{call.destino}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        call.status === 'Chamando' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500">{call.duracao}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedCall(call);
                          setShowConfirmModal(true);
                        }}
                        className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Desligar Chamada"
                      >
                        <PhoneOff className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && selectedCall && (
        <>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setShowConfirmModal(false)} />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <PhoneOff className="h-6 w-6 text-red-600" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Desligar Chamada
                </h2>
                
                <p className="text-sm text-gray-500 mb-6">
                  Você está prestes a desligar a chamada do ramal <strong>{selectedCall.ramal}</strong> com{' '}
                  <strong>{selectedCall.callerid}</strong>. Deseja continuar?
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleHangupCall(selectedCall.channel)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Desligar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
