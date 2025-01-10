import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { generateUniqueAccountId } from '../../../lib/auth';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userData: any) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd 
}) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    contato: '',
    documento: '',
    password: '',
    plano: 'Básico',
    status: 'ativo'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Primeiro, cria o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Failed to create user');

      // Gera um accountId único
      const accountId = await generateUniqueAccountId();

      // Prepara dados do usuário
      const newUserData = {
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        contato: userData.contato,
        documento: userData.documento,
        plano: userData.plano,
        status: userData.status,
        accountid: accountId,
        created_at: new Date().toISOString(),
        role: 'user'
      };

      // Insere no Supabase
      const { data, error } = await supabase
        .from('users')
        .insert([newUserData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Usuário adicionado com sucesso!');
      onAdd(data);
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Adicionar Usuário
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                required
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contato
              </label>
              <input
                type="text"
                required
                value={userData.contato}
                onChange={(e) => setUserData({ ...userData, contato: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Documento
              </label>
              <input
                type="text"
                required
                value={userData.documento}
                onChange={(e) => setUserData({ ...userData, documento: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                required
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Plano
              </label>
              <select
                value={userData.plano}
                onChange={(e) => setUserData({ ...userData, plano: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Básico">Básico</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={userData.status}
                onChange={(e) => setUserData({ ...userData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
