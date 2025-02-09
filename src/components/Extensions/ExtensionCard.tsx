import React from 'react';
import { Phone, Edit, Trash2, Copy } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Extension } from '../../types';
import { toast } from 'react-hot-toast';

interface ExtensionCardProps {
  extension: Extension;
  onEdit: (extension: Extension) => void;
  onDelete: (id: string) => void;
}

export const ExtensionCard: React.FC<ExtensionCardProps> = ({
  extension,
  onEdit,
  onDelete,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Phone className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{extension.name}</h3>
                <StatusBadge status={extension.status} />
              </div>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-sm text-gray-600">Ramal:</p>
                <button
                  onClick={() => copyToClipboard(extension.number)}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 group"
                >
                  {extension.number}
                  <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1">
            <p className="text-sm text-gray-600">Caller ID:</p>
            {extension.callerId ? (
              <button
                onClick={() => copyToClipboard(extension.callerId!)}
                className="text-sm text-gray-900 hover:text-violet-600 flex items-center gap-1 group"
              >
                {extension.callerId}
                <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <span className="text-sm text-gray-400">Não configurado</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg flex justify-end gap-2">
        <button
          onClick={() => onEdit(extension)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Editar
        </button>
        <div className="w-px h-4 bg-gray-300 my-auto"></div>
        <button
          onClick={() => onDelete(extension.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </button>
      </div>
    </div>
  );
};