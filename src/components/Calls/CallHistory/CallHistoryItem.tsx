import React from 'react';
import { format } from 'date-fns';
import { Phone, PhoneIncoming, PhoneOutgoing, Download } from 'lucide-react';
import { formatDateTime } from '../../../utils/formatters';
import type { CallHistory } from '../../../types';

interface CallHistoryItemProps {
  call: CallHistory;
  selected?: boolean;
  onSelect?: () => void;
}

export const CallHistoryItem: React.FC<CallHistoryItemProps> = ({ call, selected, onSelect }) => {
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

  const isIncoming = call.to.length === 4;
  const CallIcon = isIncoming ? PhoneIncoming : PhoneOutgoing;
  const isDownloadDisabled = call.duration < 10;

  const handleDownload = () => {
    if (isDownloadDisabled || !call.recordingUrl) return;
    window.open(call.recordingUrl, '_blank');
  };

  return (
    <tr className={`hover:bg-gray-50/50 transition-colors ${selected ? 'bg-violet-50/50' : ''}`}>
      <td className="px-4 py-3 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {formatDateTime(call.timestamp)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${isIncoming ? 'bg-indigo-100' : 'bg-violet-100'} flex items-center justify-center`}>
            <CallIcon className={`h-4 w-4 ${isIncoming ? 'text-indigo-600' : 'text-violet-600'}`} />
          </div>
          <span className="text-sm text-gray-900">{call.from}</span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {call.to}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {call.formattedDuration}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(call.status)}`}>
          {call.status}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {call.recordingUrl ? (
          <button
            onClick={handleDownload}
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
};