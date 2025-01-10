import React, { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Edit2, Trash2, Copy, Search, X } from 'lucide-react';
import type { Extension } from '../../types';
import { toast } from 'react-hot-toast';

interface VirtualizedExtensionListProps {
  extensions: Extension[];
  onEdit: (extension: Extension) => void;
  onDelete: (extension: Extension) => void;
}

export const VirtualizedExtensionList: React.FC<VirtualizedExtensionListProps> = ({
  extensions,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  // Filtragem de extensões
  const filteredExtensions = extensions.filter(ext => 
    ext.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ext.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ext.callerid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const virtualizer = useVirtualizer({
    count: filteredExtensions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // altura estimada de cada linha
    overscan: 5, // número de itens para pré-renderizar
  });

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
    toast.success('Copiado para a área de transferência!');
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Barra de Pesquisa */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número, nome ou caller ID..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cabeçalho da Tabela */}
      <div className="hidden lg:grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div>Extension</div>
        <div>Name</div>
        <div>Status</div>
        <div>Caller ID</div>
        <div>Host</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Lista Virtualizada */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: 'calc(100vh - 400px)' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const extension = filteredExtensions[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className={`absolute top-0 left-0 w-full transform flex flex-col lg:grid lg:grid-cols-6 gap-2 lg:gap-4 p-4 lg:px-6 lg:py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors`}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {/* Extension Number */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{extension.numero}</span>
                  <button
                    onClick={() => copyToClipboard(extension.numero)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copiar número do ramal"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                {/* Name */}
                <div className="text-sm text-gray-500 truncate">
                  {extension.name}
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(extension.status)}`}>
                    {extension.status === 'unknown' ? 'Indisponível' : extension.status}
                  </span>
                </div>

                {/* Caller ID */}
                <div className="text-sm text-gray-500 truncate">
                  {extension.callerid}
                </div>

                {/* Host */}
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

                {/* Actions */}
                <div className="flex lg:justify-end gap-2">
                  <button
                    onClick={() => onEdit(extension)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(extension)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estado vazio */}
      {filteredExtensions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          {searchTerm ? (
            <p>Nenhum ramal encontrado para "{searchTerm}"</p>
          ) : (
            <p>Nenhum ramal cadastrado</p>
          )}
        </div>
      )}
    </div>
  );
};
