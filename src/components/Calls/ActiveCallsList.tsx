import React from 'react';
import { ActiveCallRow } from './ActiveCallRow';
import { AgentActiveCall } from '../../hooks/useAgentActiveCalls';

interface ActiveCallsListProps {
  calls: AgentActiveCall[];
  onHangup?: (channel: string) => void;
  onTransfer?: (channel: string) => void;
  onMute?: (channel: string) => void;
}

export function ActiveCallsList({ calls, onHangup, onTransfer, onMute }: ActiveCallsListProps) {
  const formatDuration = (duration: string | number) => {
    if (typeof duration === 'string') {
      return duration;
    }
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CallerID
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ramal
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destino
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duração
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <ActiveCallRow 
              key={call.Channel} 
              call={call} 
              formatDuration={formatDuration}
              onHangup={onHangup}
              onTransfer={onTransfer}
              onMute={onMute}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}