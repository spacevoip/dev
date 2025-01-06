import React from 'react';
import { Edit2, Trash2, Copy } from 'lucide-react';
import type { Extension } from '../../types';

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              EXTENSION
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NAME
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
            <tr key={extension.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>{extension.numero}</span>
                  <button
                    onClick={() => copyToClipboard(extension.numero)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copiar número do ramal"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {extension.nome}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(extension.status)}`}>
                  {extension.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {extension.callerid}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>91.108.125.149</span>
                  <button
                    onClick={() => copyToClipboard('91.108.125.149')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copiar IP"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(extension)}
                  className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(extension)}
                  className="text-red-600 hover:text-red-900 inline-flex items-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};