import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddExtensionModal } from '../components/Extensions/AddExtensionModal';
import { EditExtensionModal } from '../components/Extensions/EditExtensionModal';
import { ExtensionList } from '../components/Extensions/ExtensionList';
import { ExtensionsLimit } from '../components/Extensions/ExtensionsLimit';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { Extension } from '../types/extension';
import { useExtensionStatus } from '../hooks/useExtensionStatus';
import { useExtensionsCount } from '../hooks/useExtensionsCount';
import { toast } from 'react-hot-toast';

export const Extensions = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExtension, setEditingExtension] = useState<Extension | null>(null);
  const { extensionStatuses } = useExtensionStatus();
  const { currentCount, planLimit, loading: limitLoading } = useExtensionsCount();

  // Removido o filtro de status: 'ativo' para mostrar todos os ramais
  const { data: extensions, loading, error, refetch } = useSupabaseQuery<Extension>('extensions');

  // Formata os dados com o status atual
  const formattedExtensions = extensions?.map(ext => ({
    ...ext,
    status: extensionStatuses[ext.numero] || 'unknown',
  })) || [];

  const handleAddClick = async () => {
    if (limitLoading) {
      toast.loading('Verificando limite de ramais...');
      return;
    }

    if (currentCount >= planLimit) {
      toast.error(
        <div>
          <p className="font-medium">Limite de ramais atingido!</p>
          <p className="text-sm mt-1">
            Seu plano permite até {planLimit} ramais.
            <br />
            Faça upgrade para adicionar mais.
          </p>
        </div>
      );
      return;
    }

    setIsAddModalOpen(true);
  };

  const handleAddSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    refetch();
    setEditingExtension(null);
  };

  const handleDelete = async (extension: Extension) => {
    if (!confirm(`Tem certeza que deseja excluir o ramal ${extension.numero}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('extensions')
        .delete()
        .eq('id', extension.id);

      if (error) throw error;

      refetch();
      toast.success('Ramal excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir ramal:', error);
      toast.error('Erro ao excluir ramal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Extensions</h1>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all"
          disabled={loading || limitLoading}
        >
          <Plus className="h-5 w-5" />
          Add Extension
        </button>
      </div>

      {/* Limite de Ramais */}
      <div className="bg-white shadow rounded-lg p-6">
        <ExtensionsLimit />
      </div>

      {/* Lista de Ramais */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Carregando ramais...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Erro ao carregar ramais: {error.message}
        </div>
      ) : formattedExtensions.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">Nenhum ramal cadastrado.</p>
          <button
            onClick={handleAddClick}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all"
          >
            <Plus className="h-5 w-5" />
            Adicionar Primeiro Ramal
          </button>
        </div>
      ) : (
        <ExtensionList
          extensions={formattedExtensions}
          onEdit={setEditingExtension}
          onDelete={handleDelete}
        />
      )}

      {/* Modais */}
      <AddExtensionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {editingExtension && (
        <EditExtensionModal
          extension={editingExtension}
          isOpen={!!editingExtension}
          onClose={() => setEditingExtension(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};