import React, { useState, useEffect, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { UsersTable } from '../../components/Admin/Users/UsersTable';
import { UserEditModal } from '../../components/Admin/Users/UserEditModal';
import { AddUserModal } from '../../components/Admin/Users/AddUserModal';
import { UserStats } from '../../components/Admin/Users/UserStats';
import { UserFilters } from '../../components/Admin/Users/UserFilters';

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
  extensions_count?: number;
}

interface Plan {
  id: number;
  nome: string;
  validade: number;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showExpired, setShowExpired] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
        throw usersError;
      }

      console.log('Dados dos usuários:', usersData); // Log para debug

      // Buscar planos
      const { data: plansData, error: plansError } = await supabase
        .from('planos')
        .select('*');

      if (plansError) throw plansError;

      // Buscar contagem de ramais para cada usuário
      const usersWithExtensions = await Promise.all(
        usersData.map(async (user) => {
          const { count, error: extensionsError } = await supabase
            .from('extensions')
            .select('*', { count: 'exact', head: true })
            .eq('accountid', user.accountid);

          if (extensionsError) {
            console.error('Erro ao buscar ramais:', extensionsError);
            return { ...user, extensions_count: 0 };
          }

          // Garantir que o status seja uma string válida
          const status = user.status?.toLowerCase() || 'inactive';
          return { 
            ...user, 
            extensions_count: count || 0,
            status: status === 'ativo' ? 'active' : (status === 'inativo' ? 'inactive' : status)
          };
        })
      );

      setUsers(usersWithExtensions || []);
      setPlans(plansData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erro ao carregar dados');
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (user: AdminUser) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      // Atualiza a lista de usuários removendo o usuário deletado
      setUsers(users.filter(u => u.id !== user.id));
      toast.success('Usuário excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleBulkActions = async (userIds: string[], action: string) => {
    try {
      switch (action) {
        case 'delete':
          const { error } = await supabase
            .from('users')
            .delete()
            .in('id', userIds);

          if (error) throw error;

          // Atualiza a lista de usuários removendo os usuários deletados
          setUsers(users.filter(user => !userIds.includes(user.id)));
          toast.success(`${userIds.length} usuário(s) excluído(s) com sucesso`);
          break;

        case 'activate':
          const { error: activateError } = await supabase
            .from('users')
            .update({ status: 'active' })
            .in('id', userIds);

          if (activateError) throw activateError;
          await fetchData(); // Recarrega os dados
          toast.success(`${userIds.length} usuário(s) ativado(s) com sucesso`);
          break;

        case 'deactivate':
          const { error: deactivateError } = await supabase
            .from('users')
            .update({ status: 'inactive' })
            .in('id', userIds);

          if (deactivateError) throw deactivateError;
          await fetchData(); // Recarrega os dados
          toast.success(`${userIds.length} usuário(s) desativado(s) com sucesso`);
          break;

        case 'plan':
          if (!action.planId) {
            toast.error('Plano não selecionado');
            return;
          }
          
          const { error: planError } = await supabase
            .from('users')
            .update({ plano: action.planId })
            .in('id', userIds);

          if (planError) throw planError;
          await fetchData(); // Recarrega os dados
          toast.success(`Plano alterado para ${userIds.length} usuário(s) com sucesso`);
          break;
      }
    } catch (error) {
      console.error('Erro ao executar ação em massa:', error);
      toast.error('Erro ao executar ação em massa');
    }
  };

  const handleUpdateUser = async (updatedUser: Partial<AdminUser>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updatedUser)
        .eq('id', selectedUser?.id);

      if (error) throw error;

      // Atualiza a lista de usuários
      setUsers(users.map(user => 
        user.id === selectedUser?.id ? { ...user, ...updatedUser } : user
      ));

      toast.success('Usuário atualizado com sucesso!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleAddUser = async (newUser: Omit<AdminUser, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (error) throw error;

      setUsers([...users, data]);
      toast.success('Usuário adicionado com sucesso!');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast.error('Erro ao adicionar usuário');
    }
  };

  // Filtered users based on search, filters and expired status
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Verificar se o usuário está vencido
      const isExpired = (() => {
        if (!showExpired) return true;
        if (!user.status || user.status !== 'ativo') return false;
        if (!user.created_at || !user.plano) return false;

        const userPlan = plans.find(p => p.nome === user.plano);
        if (!userPlan || !userPlan.validade) return false;

        // Data atual para comparação (apenas data, sem hora)
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Calcular data de vencimento (apenas data, sem hora)
        const createdAt = new Date(user.created_at);
        createdAt.setHours(0, 0, 0, 0);
        
        const validityDays = parseInt(String(userPlan.validade));
        const expirationDate = new Date(createdAt);
        expirationDate.setDate(createdAt.getDate() + validityDays);
        expirationDate.setHours(0, 0, 0, 0);

        console.log('Datas calculadas (filtro):', {
          usuario: user.name,
          criacao: createdAt.toISOString(),
          validade: validityDays + ' dias',
          vencimento: expirationDate.toISOString(),
          agora: now.toISOString()
        });

        // Retorna true se estiver vencido (comparação apenas da data)
        return now > expirationDate;
      })();

      const matchesSearch = searchTerm === '' || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.documento?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === '' || user.status === selectedStatus;
      const matchesPlan = selectedPlan === '' || user.plano === selectedPlan;

      return matchesSearch && matchesStatus && matchesPlan && (showExpired ? isExpired : true);
    });
  }, [users, searchTerm, selectedStatus, selectedPlan, showExpired, plans]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStats users={users} />

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
        users={users}
        onExpiredFilter={setShowExpired}
      />

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : (
        <UsersTable users={filteredUsers} onEdit={handleEditUser} onDelete={handleDeleteUser} onBulkActions={handleBulkActions} />
      )}

      {/* Modals */}
      {isEditModalOpen && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateUser}
        />
      )}

      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddUser}
        />
      )}
    </div>
  );
};