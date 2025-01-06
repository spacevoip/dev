import React from 'react';
import { PlayCircle, XCircle } from 'lucide-react';

interface CallRecordingButtonProps {
  recordingUrl?: string;
}

export const CallRecordingButton: React.FC<CallRecordingButtonProps> = ({ recordingUrl }) => {
  if (!recordingUrl) {
    return (
      <div className="flex items-center text-gray-400">
        <XCircle className="h-5 w-5" />
      </div>
    );
  }

  return (
    <button
      onClick={() => window.open(recordingUrl, '_blank')}
      className="flex items-center text-blue-600 hover:text-blue-800"
    >
      <PlayCircle className="h-5 w-5" />
    </button>
  );
};