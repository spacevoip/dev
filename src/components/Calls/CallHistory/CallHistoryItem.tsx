import React from 'react';
import { CallRecordingButton } from './CallRecordingButton';
import { formatDateTime, formatDurationTotal } from '../../../utils/formatters';
import { HelpCircle } from 'lucide-react';
import type { CallHistory } from '../../../types';

interface CallHistoryItemProps {
  call: CallHistory;
}

export const CallHistoryItem: React.FC<CallHistoryItemProps> = ({ call }) => {
  const getStatusColor = (status: CallHistory['status']) => {
    switch (status) {
      case 'ATENDIDO':
        return 'bg-green-100 text-green-800';
      case 'NÃO ATENDIDO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {call.from}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {call.to}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDurationTotal(call.cdrDuration)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-1">
          {formatDurationTotal(call.duration)}
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-gray-400" />
            <div className="absolute hidden group-hover:block bg-black text-white text-xs rounded p-2 min-w-[200px] -left-1/2 transform -translate-x-1/2 mt-1 z-10">
              Este é o tempo Real Calculado desde iniciou a Chamada
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(call.status)}`}>
          {call.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <CallRecordingButton recordingUrl={call.recordingUrl} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDateTime(call.start)}
      </td>
    </tr>
  );
};