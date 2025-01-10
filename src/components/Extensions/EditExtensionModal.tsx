import React from 'react';
import { X, Phone, Hash, User, AtSign, Lock, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Extension } from '../../types/extension';
import { useAuth } from '../../contexts/AuthContext';

interface EditExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  extension: Extension;
}

export const EditExtensionModal: React.FC<EditExtensionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  extension,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = React.useState({
    nome: extension.nome,
    callerid: extension.callerid || '',
    senha: '',
  });
  const [loading, setLoading] = React.useState(false);

  // Verifica se o usuário tem permissão para editar o ramal
  const hasPermission = React.useMemo(() => {
    if (!user) return false;
    return user.accountid === extension.accountid || user.role === 'admin';
  }, [user, extension.accountid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission) {
      toast.error('Você não tem permissão para editar este ramal');
      return;
    }

    if (!user?.accountid) {
      toast.error('Erro de autenticação');
      return;
    }

    setLoading(true);

    try {
      const updateData: Partial<Extension> = {
        nome: formData.nome,
        callerid: formData.callerid,
      };

      if (formData.senha) {
        updateData.senha = formData.senha;
      }

      const { error } = await supabase
        .from('extensions')
        .update(updateData)
        .match({ id: extension.id, accountid: user.accountid });

      if (error) throw error;

      toast.success('Ramal atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar ramal:', error);
      toast.error('Erro ao atualizar ramal. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Se não tiver permissão, nem mostra o modal
  if (!hasPermission) {
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Phone className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Editar Ramal</h2>
              <p className="text-sm text-gray-500">Configure as informações do ramal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Número */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Hash className="h-4 w-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">
                Número
              </label>
            </div>
            <input
              type="text"
              value={extension.numero}
              disabled
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Nome */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <User className="h-4 w-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">
                Nome
              </label>
            </div>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              required
            />
          </div>

          {/* Caller ID */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <AtSign className="h-4 w-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">
                Caller ID
              </label>
            </div>
            <input
              type="text"
              value={formData.callerid}
              onChange={(e) => setFormData(prev => ({ ...prev, callerid: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
          </div>

          {/* Nova Senha */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Lock className="h-4 w-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">
                Nova Senha (opcional)
              </label>
            </div>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              placeholder="Deixe em branco para manter a senha atual"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white inline-flex items-center gap-2 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800'
              } transition-colors`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
