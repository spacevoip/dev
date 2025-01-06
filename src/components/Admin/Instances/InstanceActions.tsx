import React from 'react';
import { MoreVertical, Play, Pause, Settings, Trash2 } from 'lucide-react';

interface InstanceActionsProps {
  onManage: () => void;
  onSuspend: () => void;
  onResume: () => void;
  onDelete: () => void;
  isActive: boolean;
}

export const InstanceActions: React.FC<InstanceActionsProps> = ({
  onManage,
  onSuspend,
  onResume,
  onDelete,
  isActive,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <MoreVertical className="h-5 w-5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
          <button
            onClick={() => {
              onManage();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage
          </button>
          
          {isActive ? (
            <button
              onClick={() => {
                onSuspend();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-yellow-600"
            >
              <Pause className="h-4 w-4" />
              Suspend
            </button>
          ) : (
            <button
              onClick={() => {
                onResume();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-green-600"
            >
              <Play className="h-4 w-4" />
              Resume
            </button>
          )}

          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};