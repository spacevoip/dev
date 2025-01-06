import React from 'react';
import { Modal } from '../Common/Modal';
import { Extension } from '../../types/extension';
import { supabase } from '../../lib/supabase';
import { generatePassword } from '../../utils/passwordGenerator';

interface EditExtensionModalProps {
  extension: Extension;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  callerId: string;
  senha: string;
}

export const EditExtensionModal: React.FC<EditExtensionModalProps> = ({
  extension,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    name: extension.nome,
    callerId: extension.callerid,
    senha: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('extensions')
        .update({
          nome: formData.name,
          callerid: formData.callerId,
          ...(formData.senha ? { senha: formData.senha } : {}),
        })
        .eq('id', extension.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar ramal:', error);
      alert('Erro ao atualizar ramal. Por favor, tente novamente.');
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, senha: newPassword }));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Editar Ramal ${extension.numero}`}
      description="Atualize as informações do ramal."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Ramal (Não editável) */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Ramal
          </label>
          <input
            type="text"
            value={extension.numero}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500"
            disabled
          />
          <p className="text-sm text-gray-500">
            O número do ramal não pode ser alterado.
          </p>
        </div>

        {/* Caller ID */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Caller ID
          </label>
          <input
            type="text"
            pattern="[0-9]*"
            value={formData.callerId}
            onChange={(e) => setFormData({ ...formData, callerId: e.target.value })}
            placeholder="Ex: 11999999999"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Senha */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Nova Senha (opcional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Deixe em branco para manter a senha atual"
            />
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Gerar
            </button>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </Modal>
  );
};
