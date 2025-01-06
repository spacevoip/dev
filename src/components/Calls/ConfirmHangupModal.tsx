import React from 'react';
import { X, PhoneOff } from 'lucide-react';

interface ConfirmHangupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  callInfo: {
    ramal: string;
    callerid: string;
  };
}

export const ConfirmHangupModal: React.FC<ConfirmHangupModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  callInfo,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <PhoneOff className="h-6 w-6 text-red-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Desligar Chamada
            </h2>
            
            <p className="text-sm text-gray-500 mb-6">
              Você está prestes a desligar a chamada do ramal <strong>{callInfo.ramal}</strong> com{' '}
              <strong>{callInfo.callerid}</strong>. Deseja continuar?
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Desligar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
