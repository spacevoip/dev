import React from 'react';
import { Modal } from '../Common/Modal';
import { AddExtensionForm } from './AddExtensionForm';
import { useExtensionsCount } from '../../hooks/useExtensionsCount';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { AlertCircle } from 'lucide-react';

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
  const { currentCount, planLimit, loading, error } = useExtensionsCount();
  const { currentUser } = useCurrentUser();

  if (!isOpen) return null;

  const handleSubmit = async (data: {
    name: string;
    extension: string;
    callerId: string;
    senha: string;
  }) => {
    // Validações iniciais
    if (!currentUser?.accountid) {
      alert('Erro: Usuário não identificado. Por favor, faça login novamente.');
      return;
    }

    if (error) {
      alert('Erro ao verificar limite de ramais. Por favor, tente novamente.');
      return;
    }

    // Verificação de limite
    if (currentCount >= planLimit) {
      alert(`Limite de ramais atingido!\n\nSeu plano atual permite até ${planLimit} ramais.\nVocê já possui ${currentCount} ramais ativos.\n\nPara adicionar mais ramais, faça upgrade do seu plano.`);
      return;
    }

    try {
      // Verifica se o ramal já existe
      const { data: existingExtension } = await supabase
        .from('extensions')
        .select('numero')
        .eq('numero', data.extension)
        .single();

      if (existingExtension) {
        alert(`O ramal ${data.extension} já está em uso. Por favor, escolha outro número.`);
        return;
      }

      // Cria o novo ramal
      const { error: insertError } = await supabase
        .from('extensions')
        .insert([
          {
            nome: data.name,
            numero: data.extension,
            callerid: data.callerId,
            senha: data.senha,
            accountid: currentUser.accountid,
            contexto: 'from-internal',
            status: 'ativo',
            max_contacts: 1
          },
        ]);

      if (insertError) throw insertError;

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
      ) : error ? (
        <div className="text-center py-4 text-red-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Erro ao verificar limite de ramais.</p>
          <p className="text-sm text-gray-500 mt-1">Por favor, tente novamente mais tarde.</p>
        </div>
      ) : currentCount >= planLimit ? (
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <p className="text-lg font-semibold text-gray-900">
            Limite de Ramais Atingido
          </p>
          <p className="text-gray-600 mt-2">
            Seu plano atual permite até <span className="font-medium">{planLimit}</span> ramais.
          </p>
          <p className="text-gray-600">
            Você já possui <span className="font-medium">{currentCount}</span> ramais ativos.
          </p>
          <div className="mt-4">
            <a
              href="/planos"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Fazer Upgrade do Plano
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              Ramais disponíveis: <span className="font-medium">{planLimit - currentCount}</span> de <span className="font-medium">{planLimit}</span>
            </p>
          </div>
          <AddExtensionForm onSubmit={handleSubmit} onCancel={onClose} />
        </>
      )}
    </Modal>
  );
};
