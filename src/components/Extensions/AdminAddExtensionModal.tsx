import React, { useEffect, useState } from 'react';
import { Modal } from '../Common/Modal';
import { AddExtensionForm } from './AddExtensionForm';
import { supabase } from '../../lib/supabase';
import { generateAccountId, isValidAccountId } from '../../utils/accountIdGenerator';

interface AdminAddExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Account {
  id: string;
  name: string;
  accountid: string;
}

export const AdminAddExtensionModal: React.FC<AdminAddExtensionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, accountid')
          .order('name');

        if (error) throw error;

        // Filtra apenas contas com accountid válido
        const validAccounts = data?.filter(account => isValidAccountId(account.accountid)) || [];
        setAccounts(validAccounts);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar contas:', err);
        setError('Erro ao carregar lista de contas');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchAccounts();
      setSelectedAccount(''); // Reset selection when modal opens
    }
  }, [isOpen]);

  const handleSubmit = async (data: {
    name: string;
    extension: string;
    callerId: string;
    senha: string;
  }) => {
    if (!selectedAccount) {
      alert('Por favor, selecione uma conta');
      return;
    }

    try {
      // Primeiro, verifica se o ramal já existe
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

      // Se não existe, cria o novo ramal
      const { error: insertError } = await supabase
        .from('extensions')
        .insert({
          nome: data.name,
          numero: data.extension,
          callerid: data.callerId,
          senha: data.senha,
          accountid: selectedAccount,
          status: 'ativo',
          contexto: 'from-internal'
        });

      if (insertError) {
        console.error('Erro ao inserir:', insertError);
        throw insertError;
      }

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
      description="Crie um novo ramal e associe a uma conta."
    >
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Carregando contas...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-600">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione a Conta
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              required
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.accountid}>
                  {account.name} ({account.accountid})
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <AddExtensionForm 
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          )}
        </div>
      )}
    </Modal>
  );
};
