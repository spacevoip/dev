import React, { useState } from 'react';
import { Modal } from '../Common/Modal';
import { AddExtensionForm } from './AddExtensionForm';
import { supabase } from '../../lib/supabase';
import { Extension } from '../../types/extension';

interface AdminEditExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  extension: Extension;
}

export const AdminEditExtensionModal: React.FC<AdminEditExtensionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  extension,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    extension: string;
    callerId: string;
    senha: string;
  }) => {
    setLoading(true);
    try {
      // Verifica se o número foi alterado e se já existe
      if (data.extension !== extension.numero) {
        const { data: existingExtension } = await supabase
          .from('extensions')
          .select('numero')
          .eq('numero', data.extension)
          .eq('status', 'ativo')
          .single();

        if (existingExtension) {
          alert('Este número de ramal já está em uso.');
          return;
        }
      }

      // Mantém o accountid original e o contexto
      const { error: updateError } = await supabase
        .from('extensions')
        .update({
          nome: data.name,
          numero: data.extension,
          callerid: data.callerId,
          senha: data.senha,
          contexto: 'from-internal',
          accountid: extension.accountid // Mantém o accountid original
        })
        .eq('id', extension.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar ramal:', error);
      alert('Erro ao atualizar ramal. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Ramal"
      description={`Editando ramal ${extension.numero} - Conta: ${extension.accountid}`}
    >
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Atualizando ramal...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mostra o Account ID de forma não editável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account ID
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
              {extension.accountid}
            </div>
          </div>

          <AddExtensionForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            initialData={{
              name: extension.nome,
              extension: extension.numero,
              callerId: extension.callerid || '',
              senha: extension.senha || ''
            }}
          />
        </div>
      )}
    </Modal>
  );
};
