import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface ExtensionActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const ExtensionActions: React.FC<ExtensionActionsProps> = ({ onEdit, onDelete }) => {
  return (
    <>
      <button
        onClick={onEdit}
        className="text-blue-600 hover:text-blue-900 mr-3"
      >
        <Edit className="h-5 w-5" />
      </button>
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-900"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </>
  );
};