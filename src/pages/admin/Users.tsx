import React, { useState, useEffect } from 'react';
import { UsersList } from '../../components/Admin/Users/UsersList';
import { Plus } from 'lucide-react';
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
    } finally {
      setLoading(false);
    }
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
        .update({
          name: userData.name,
          email: userData.email,
          plano: userData.plano,
          status: userData.status,
          ...(userData.password ? { password: userData.password } : {})
        })
        .eq('id', userData.id);

      if (error) throw error;

      toast.success('Usuário atualizado com sucesso!');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== id));
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
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Adicionar Usuário
        </button>
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