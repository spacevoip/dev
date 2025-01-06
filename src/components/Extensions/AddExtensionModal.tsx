import React from 'react';
import { Modal } from '../Common/Modal';
import { AddExtensionForm } from './AddExtensionForm';
import { useExtensionsCount } from '../../hooks/useExtensionsCount';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface AddExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddExtensionModal: React.FC<AddExtensionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentCount, planLimit, loading } = useExtensionsCount();
  const { currentUser } = useCurrentUser();

  if (!isOpen) return null;

  const handleSubmit = async (data: {
    name: string;
    extension: string;
    callerId: string;
    senha: string;
  }) => {
    if (currentCount >= planLimit) {
      alert('Você atingiu o limite de ramais do seu plano.');
      return;
    }

    try {
      const { error } = await supabase
        .from('extensions')
        .insert([
          {
            nome: data.name,
            numero: data.extension,
            callerid: data.callerId,
            senha: data.senha,
            accountid: currentUser?.accountid,
            contexto: 'from-internal',
            status: 'ativo',
            max_contacts: 1
          },
        ]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar ramal:', error);
      alert('Erro ao criar ramal. Por favor, tente novamente.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Novo Ramal"
      description="Crie um novo ramal para seu sistema PABX."
    >
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Verificando limite de ramais...</p>
        </div>
      ) : currentCount >= planLimit ? (
        <div className="text-center py-4">
          <p className="text-red-600">
            Você atingiu o limite de {planLimit} ramais do seu plano.
          </p>
          <p className="text-gray-500 mt-2">
            Entre em contato conosco para aumentar seu limite.
          </p>
        </div>
      ) : (
        <AddExtensionForm onSubmit={handleSubmit} onCancel={onClose} />
      )}
    </Modal>
  );
};
