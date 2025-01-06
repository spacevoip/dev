import React from 'react';
import { CallStatusIcon } from './CallStatusIcon';
import { CallActions } from './CallActions';
import { formatDuration } from '../../utils/formatters';
import type { ActiveCall } from '../../types';

interface CallItemProps {
  call: ActiveCall;
  onHold: (id: string) => void;
  onTransfer: (id: string) => void;
  onEnd: (id: string) => void;
}

export const CallItem: React.FC<CallItemProps> = ({ 
  call, 
  onHold, 
  onTransfer,
  onEnd 
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <CallStatusIcon status={call.status} />
        <div>
          <p className="font-medium">
            {call.from} → {call.to}
          </p>
          <p className="text-sm text-gray-500">
            Duration: {formatDuration(call.duration)}
          </p>
        </div>
      </div>
      
      <CallActions
        onHold={() => onHold(call.id)}
        onTransfer={() => onTransfer(call.id)}
        onEnd={() => onEnd(call.id)}
      />
    </div>
  );
};