import React from 'react';
import { Pause, PhoneForwarded, PhoneOff } from 'lucide-react';

interface CallActionsProps {
  onHold: () => void;
  onTransfer: () => void;
  onEnd: () => void;
}

export const CallActions: React.FC<CallActionsProps> = ({ onHold, onTransfer, onEnd }) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onHold}
        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
        title="Hold Call"
      >
        <Pause className="h-5 w-5" />
      </button>
      <button
        onClick={onTransfer}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
        title="Transfer Call"
      >
        <PhoneForwarded className="h-5 w-5" />
      </button>
      <button
        onClick={onEnd}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
        title="End Call"
      >
        <PhoneOff className="h-5 w-5" />
      </button>
    </div>
  );
};