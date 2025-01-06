import React from 'react';
import { CallItem } from './CallItem';
import type { ActiveCall } from '../../types';

interface ActiveCallsListProps {
  calls: ActiveCall[];
  onHold: (id: string) => void;
  onTransfer: (id: string) => void;
  onEnd: (id: string) => void;
}

export const ActiveCallsList: React.FC<ActiveCallsListProps> = ({
  calls,
  onHold,
  onTransfer,
  onEnd,
}) => {
  return (
    <div className="space-y-4">
      {calls.map((call) => (
        <CallItem
          key={call.id}
          call={call}
          onHold={onHold}
          onTransfer={onTransfer}
          onEnd={onEnd}
        />
      ))}
    </div>
  );
};