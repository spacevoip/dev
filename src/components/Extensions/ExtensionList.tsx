import React from 'react';
import { Edit2, Trash2, Copy } from 'lucide-react';
import type { Extension } from '../../types';
import { toast } from 'react-hot-toast';

interface ExtensionListProps {
  extensions: Extension[];
  onEdit: (extension: Extension) => void;
  onDelete: (extension: Extension) => void;
}

export const ExtensionList: React.FC<ExtensionListProps> = ({
  extensions,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'unknown') {
      return 'bg-gray-100 text-gray-800';
    }
    if (statusLower === 'online (livre)') {
      return 'bg-green-100 text-green-800';
    }
    if (statusLower === 'offline') {
      return 'bg-gray-100 text-gray-800';
    }
    if (statusLower === 'em chamada') {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EXTENSION
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AGENTE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CALLER ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                HOST
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {extensions.map((extension) => (
              <tr 
                key={extension.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{extension.numero}</span>
                    <button
                      onClick={() => copyToClipboard(extension.numero)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copiar número do ramal"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{extension.nome}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(extension.status)}`}
                  >
                    {extension.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{extension.callerid}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">91.108.125.149</span>
                    <button
                      onClick={() => copyToClipboard('91.108.125.149')}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copiar IP"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(extension)}
                      className="text-violet-600 hover:text-violet-900 transition-colors"
                      title="Editar ramal"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(extension)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Excluir ramal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};