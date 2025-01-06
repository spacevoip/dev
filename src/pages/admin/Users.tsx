import React, { useState, useEffect } from 'react';
import { UsersList } from '../../components/Admin/Users/UsersList';
import { Plus, RefreshCw } from 'lucide-react';
import type { AdminUser } from '../../types/admin';
import { supabase } from '../../lib/supabase';
import { AddUserModal } from '../../components/Admin/Users/AddUserModal';
import { toast } from 'react-hot-toast';

const mockUsers: AdminUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    lastLogin: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'support',
    lastLogin: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'viewer',
    lastLogin: new Date(Date.now() - 86400000),
  },
];

export const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro buscar todos os planos
      const { data: planos } = await supabase
        .from('planos')
        .select('*');

      console.log('Planos:', planos); // Log para ver os planos

      // Depois buscar os usuários
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('name');

      console.log('Users:', users); // Log para ver os usuários

      if (usersError) {
        throw usersError;
      }

      if (users && planos) {
        const formattedUsers = users.map(user => {
          const userPlano = planos.find(p => p.nome === user.plano);
          console.log(`User ${user.name} has plano ${user.plano}, found plano:`, userPlano); // Log para debug
          return {
            ...user,
            limite: userPlano?.limite || 0
          };
        });
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Erro ao carregar usuários');
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (userData: Omit<AdminUser, 'id' | 'last_login' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ ...userData, status: 'ativo' }])
        .select()
        .single();

      if (error) throw error;

      setUsers(prev => [...prev, data]);
      setIsAddModalOpen(false);
      toast.success('Usuário adicionado com sucesso!');
    } catch (err) {
      console.error('Erro ao adicionar usuário:', err);
      toast.error('Erro ao adicionar usuário. Tente novamente.');
    }
  };

  const handleEditUser = async (userData: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userData.id);

      if (error) throw error;

      setUsers(prev =>
        prev.map(user => (user.id === userData.id ? { ...user, ...userData } : user))
      );
      toast.success('Usuário atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      toast.error('Erro ao atualizar usuário. Tente novamente.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success('Usuário excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      toast.error('Erro ao excluir usuário. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-500">Gerencie os usuários do sistema</p>
        </div>
        <div className="space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Adicionar Usuário
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <UsersList 
        users={users} 
        loading={loading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
      />
    </div>
  );
};