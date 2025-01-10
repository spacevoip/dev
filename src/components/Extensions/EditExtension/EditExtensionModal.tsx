import React from 'react';
import { X, Phone, Hash, User, AtSign, Lock } from 'lucide-react';
import { EditExtensionForm } from './EditExtensionForm';
import type { Extension } from '../../../types';

interface EditExtensionModalProps {
  isOpen: boolean;
  extension: Extension;
  onClose: () => void;
  onSubmit: (data: {
    id: string;
    name: string;
    callerId: string;
    password?: string;
  }) => void;
}

export const EditExtensionModal: React.FC<EditExtensionModalProps> = ({
  isOpen,
  extension,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-modal-enter overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Editar Ramal</h2>
                <p className="text-sm text-violet-100">Ramal {extension.number}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-violet-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Hash className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-violet-600 font-medium">Número</p>
                <p className="text-sm text-gray-900">{extension.number}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg">
              <div className="p-2 bg-violet-100 rounded-lg">
                <User className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-violet-600 font-medium">Nome</p>
                <p className="text-sm text-gray-900">{extension.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg">
              <div className="p-2 bg-violet-100 rounded-lg">
                <AtSign className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-violet-600 font-medium">Caller ID</p>
                <p className="text-sm text-gray-900">{extension.callerId || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Lock className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-violet-600 font-medium">Senha</p>
                <p className="text-sm text-gray-900">••••••••</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <EditExtensionForm
            extension={extension}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};