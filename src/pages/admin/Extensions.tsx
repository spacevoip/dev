import React, { useState } from 'react';
import { Plus, Search, Phone, Edit, Trash2, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { useAdminSupabaseQuery } from '../../hooks/useAdminSupabaseQuery';
import { useExtensionStatus } from '../../hooks/useExtensionStatus';
import { Extension } from '../../types/extension';
import { supabase } from '../../lib/supabase';
import { AdminAddExtensionModal } from '../../components/Extensions/AdminAddExtensionModal';
import { AdminEditExtensionModal } from '../../components/Extensions/AdminEditExtensionModal';
import { toast } from 'sonner';

export const AdminExtensions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExtension, setEditingExtension] = useState<Extension | null>(null);
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
  const { extensionStatuses, error: statusError } = useExtensionStatus();

  const { data: extensions, loading, error, refetch } = useAdminSupabaseQuery<Extension>('extensions', {
    select: '*',
    options: {
      count: 'exact'
    }
  });

  const handleDelete = async (extension: Extension) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o ramal ${extension.numero}?\nEsta ação não poderá ser desfeita.`);
    
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('extensions')
        .delete()
        .eq('id', extension.id);

      if (error) throw error;
      
      refetch();
      toast.success(`Ramal ${extension.numero} excluído com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir ramal:', error);
      toast.error('Erro ao excluir ramal. Por favor, tente novamente.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedExtensions.length === 0) return;

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir ${selectedExtensions.length} ramal(is)?\nEsta ação não poderá ser desfeita.`
    );
    
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('extensions')
        .delete()
        .in('id', selectedExtensions);

      if (error) throw error;
      
      setSelectedExtensions([]);
      refetch();
      toast.success(`${selectedExtensions.length} ramal(is) excluído(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir ramais:', error);
      toast.error('Erro ao excluir ramais. Por favor, tente novamente.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedExtensions.length === filteredExtensions.length) {
      setSelectedExtensions([]);
    } else {
      setSelectedExtensions(filteredExtensions.map(ext => ext.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedExtensions(prev => 
      prev.includes(id) 
        ? prev.filter(extId => extId !== id)
        : [...prev, id]
    );
  };

  const handleAddSuccess = () => {
    refetch();
    toast.success('Ramal adicionado com sucesso!');
  };

  const handleEditSuccess = () => {
    refetch();
    setEditingExtension(null);
    toast.success('Ramal atualizado com sucesso!');
  };

  const filteredExtensions = extensions?.filter(ext => 
    ext.numero?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    ext.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ext.accountid?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusStyle = (status: string) => {
    if (status === 'Online (Livre)') {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (status === 'Em Chamada') {
      return 'bg-orange-100 text-orange-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Ramais</h2>
          <p className="text-gray-500">
            Visualize e gerencie todos os ramais do sistema ({extensions?.length || 0} ramais cadastrados)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedExtensions.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              <span>Excluir Selecionados ({selectedExtensions.length})</span>
            </button>
          )}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Ramal</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por número, nome ou ID da conta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>

      {/* Extensions Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={selectedExtensions.length === filteredExtensions.length ? "Desmarcar todos" : "Selecionar todos"}
                  >
                    {selectedExtensions.length === filteredExtensions.length ? (
                      <CheckSquare className="h-5 w-5 text-violet-500" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">Ramal</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">Account ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-500"></div>
                      <span>Carregando ramais...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-red-500">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Erro ao carregar ramais: {error}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredExtensions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'Nenhum ramal encontrado para esta busca' : 'Nenhum ramal cadastrado'}
                  </td>
                </tr>
              ) : (
                filteredExtensions.map((ext) => {
                  const status = statusError ? 'Erro ao carregar status' : (extensionStatuses[ext.numero] || 'Desconhecido');
                  return (
                    <tr key={ext.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleSelect(ext.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title={selectedExtensions.includes(ext.id) ? "Desmarcar" : "Selecionar"}
                        >
                          {selectedExtensions.includes(ext.id) ? (
                            <CheckSquare className="h-5 w-5 text-violet-500" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                            <Phone className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{ext.numero}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{ext.nome}</td>
                      <td className="px-6 py-4 text-gray-500">
                        <span className="font-mono text-sm">{ext.accountid}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingExtension(ext)}
                            className="p-2 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
                            title="Editar ramal"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(ext)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir ramal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adicionar Ramal */}
      <AdminAddExtensionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal de Editar Ramal */}
      {editingExtension && (
        <AdminEditExtensionModal
          isOpen={true}
          onClose={() => setEditingExtension(null)}
          onSuccess={handleEditSuccess}
          extension={editingExtension}
        />
      )}
    </div>
  );
};
