import React from 'react';
import { X } from 'lucide-react';
import { AddExtensionForm } from './AddExtensionForm';

interface AddExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    extension: string;
    callerId: string;
    password: string;
  }) => void;
}

export const AddExtensionModal: React.FC<AddExtensionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add New Extension</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <AddExtensionForm onSubmit={onSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
};