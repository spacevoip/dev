import React from 'react';
import { Modal } from '../Common/Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  extensionNumber: string;
}

export const DeleteExtensionModal: React.FC<DeleteExtensionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  extensionNumber,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir Ramal"
    >
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        
        <p className="text-center text-gray-600 mb-6">
          Tem certeza que deseja excluir o ramal {extensionNumber}?
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Excluir
          </button>
        </div>
      </div>
    </Modal>
  );
};
