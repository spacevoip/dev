import React, { useState, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { AddExtensionModal } from '../components/Extensions/AddExtensionModal';
import { EditExtensionModal } from '../components/Extensions/EditExtensionModal';
import { ExtensionList } from '../components/Extensions/ExtensionList';
import { ExtensionsLimit } from '../components/Extensions/ExtensionsLimit';
import { DeleteExtensionModal } from '../components/Extensions/DeleteExtensionModal';
import { ExtensionStats } from '../components/Extensions/ExtensionStats';
import { useExtensionsCount } from '../hooks/useExtensionsCount';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Extension } from '../types/extension';
import { useAuth } from '../contexts/AuthContext';
import { useExtensionsStatus } from '../hooks/useExtensionsStatus';

export const Extensions = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExtension, setEditingExtension] = useState<Extension | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [extensionToDelete, setExtensionToDelete] = useState<Extension | null>(null);
  const { currentCount, planLimit, loading: limitLoading } = useExtensionsCount();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Queries para buscar ramais
  const { data: extensions = [] } = useQuery<Extension[]>({
    queryKey: ['extensions', user?.accountid],
    queryFn: async () => {
      if (!user?.accountid) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('extensions')
        .select('*, snystatus')
        .eq('accountid', user.accountid)
        .order('numero');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.accountid,
    refetchInterval: 5000 // Atualiza a cada 5 segundos para ter o status atualizado
  });

  // Queries para status dos ramais
  const extensionStatuses = useExtensionsStatus(extensions);

  // Mutation para deletar extensão
  const deleteMutation = useMutation({
    mutationFn: async (extensionId: string) => {
      if (!user?.accountid) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('extensions')
        .delete()
        .match({ id: extensionId, accountid: user.accountid });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extensions', user?.accountid]);
      toast.success('Ramal excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir ramal:', error);
      toast.error('Erro ao excluir ramal');
    }
  });

  const handleAddClick = useCallback(() => {
    if (!user?.accountid) {
      toast.error('Usuário não autenticado');
      return;
    }

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
  }, [currentCount, planLimit, limitLoading, user?.accountid]);

  const handleAddSuccess = useCallback(() => {
    queryClient.invalidateQueries(['extensions', user?.accountid]);
    setIsAddModalOpen(false);
  }, [queryClient, user?.accountid]);

  const handleEditSuccess = useCallback(() => {
    queryClient.invalidateQueries(['extensions', user?.accountid]);
    setEditingExtension(null);
  }, [queryClient, user?.accountid]);

  const handleEdit = useCallback((extension: Extension) => {
    if (!user) {
      toast.error('Você precisa estar logado para editar ramais');
      return;
    }

    if (user.accountid !== extension.accountid && user.role !== 'admin') {
      toast.error('Você não tem permissão para editar este ramal');
      return;
    }

    setEditingExtension(extension);
  }, [user]);

  const handleDelete = useCallback((extension: Extension) => {
    if (!user?.accountid) {
      toast.error('Usuário não identificado');
      return;
    }

    if (extension.accountid !== user.accountid) {
      toast.error('Você não tem permissão para excluir este ramal');
      return;
    }

    setExtensionToDelete(extension);
    setIsDeleteModalOpen(true);
  }, [user?.accountid]);

  const handleDeleteConfirm = useCallback(async () => {
    if (extensionToDelete) {
      deleteMutation.mutate(extensionToDelete.id);
      setIsDeleteModalOpen(false);
    }
  }, [extensionToDelete, deleteMutation]);

  const handleDeleteCancel = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  // Se não houver usuário autenticado, mostra mensagem
  if (!user?.accountid) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Não autorizado</h2>
          <p className="mt-2 text-gray-600">Faça login para acessar os ramais.</p>
        </div>
      </div>
    );
  }

  const formattedExtensions = extensions.map(ext => ({
    ...ext,
    status: extensionStatuses[ext.numero] || 'unknown'
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Ramais</h1>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
            disabled={currentCount >= planLimit}
          >
            <Plus className="h-5 w-5" />
            Adicionar Ramal
          </button>
        </div>

        <ExtensionsLimit showProgressBar className="mb-2" />
        
        <ExtensionStats 
          extensions={extensions} 
          extensionStatuses={extensionStatuses}
        />

        {extensions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">Nenhum ramal cadastrado.</p>
            <button
              onClick={handleAddClick}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all"
            >
              <Plus className="h-5 w-5" />
              Adicionar Primeiro Ramal
            </button>
          </div>
        ) : (
          <ExtensionList
            extensions={formattedExtensions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <AddExtensionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
          accountId={user?.accountid || ''}
        />

        {editingExtension && (
          <EditExtensionModal
            extension={editingExtension}
            isOpen={!!editingExtension}
            onClose={() => setEditingExtension(null)}
            onSuccess={handleEditSuccess}
          />
        )}

        <DeleteExtensionModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          extension={extensionToDelete}
        />
      </div>
    </div>
  );
};