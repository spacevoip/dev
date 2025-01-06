import React from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Download } from 'lucide-react';
import { formatDateTime } from '../../../utils/formatters';
import type { CallHistory } from '../../../types';

interface CallHistoryListProps {
  calls: CallHistory[];
  loading?: boolean;
  error?: string | null;
}

export const CallHistoryList: React.FC<CallHistoryListProps> = ({
  calls,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4" />
        <div className="text-gray-500">Carregando chamadas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 bg-red-50 rounded-xl">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!calls.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm">
        <Phone className="h-12 w-12 text-gray-400 mb-4" />
        <div className="text-gray-500">Nenhuma chamada encontrada</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'atendida':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'não atendida':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ocupado':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'falhou':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCallIcon = (from: string, to: string) => {
    const isIncoming = to.length === 4; // Se o destino tem 4 dígitos, é uma chamada recebida
    return isIncoming ? PhoneIncoming : PhoneOutgoing;
  };

  const handleDownload = (url: string, duration: number) => {
    // Se a duração for menor que 10 segundos, não faz nada
    if (duration < 10) return;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                De
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Para
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duração
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gravação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {calls.map((call) => {
              const CallIcon = getCallIcon(call.from, call.to);
              const isDownloadDisabled = call.duration < 10;
              return (
                <tr key={call.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <CallIcon className="h-4 w-4 text-violet-600" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.from}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.to}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(call.status)}`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.formattedDuration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(call.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {call.recordingUrl ? (
                      <button
                        onClick={() => handleDownload(call.recordingUrl!, call.duration)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          isDownloadDisabled 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                        }`}
                        disabled={isDownloadDisabled}
                        title={isDownloadDisabled ? 'Chamada muito curta para ter gravação' : 'Baixar gravação'}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};