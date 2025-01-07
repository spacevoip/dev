import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { UsersTable } from '../../components/Admin/Users/UsersTable';
import { UserEditModal } from '../../components/Admin/Users/UserEditModal';
import { AddUserModal } from '../../components/Admin/Users/AddUserModal';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  contato: string;
  accountid: string;
  plano: string;
  created_at: string;
  last_login?: string;
  documento?: string;
  status?: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar usuários
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (usersError) {
        throw usersError;
      }

      if (users) {
        setUsers(users);
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (updatedUser: Partial<AdminUser>) => {
    if (!selectedUser) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updatedUser)
        .eq('id', selectedUser.id)
        .select()
        .single();

      if (error) throw error;

      // Atualiza a lista de usuários
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? { ...user, ...updatedUser } : user
        )
      );

      toast.success('Usuário atualizado com sucesso!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      // Atualiza a lista de usuários com o novo usuário
      setUsers(prevUsers => [...prevUsers, userData]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast.error('Erro ao adicionar usuário');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.contato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.accountid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
        <div className="flex space-x-4">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Usuário
          </button>
        </div>
      </div>

      {/* Campo de Pesquisa */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, email, contato ou account ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>

      {/* Contador de Resultados */}
      <div className="text-sm text-gray-500 mb-6">
        Exibindo {filteredUsers.length} usuários de {users.length}
      </div>

      <UsersTable 
        users={filteredUsers} 
        onEdit={handleEditUser}
      />

      {isAddModalOpen && (
        <AddUserModal 
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddUser}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <UserEditModal 
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
};