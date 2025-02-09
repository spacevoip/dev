import React, { useState, useEffect, useMemo } from 'react';
import { Plus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
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
  status: string;
  plano: string;
  created_at: string;
  expiration_date?: string;
  validity: number;
  extensions_count: number;
  valido: boolean;
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar todos os usuários primeiro
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;

      // Buscar planos
      const { data: plans, error: plansError } = await supabase
        .from('planos')
        .select('*');

      if (plansError) throw plansError;

      // Criar mapa de planos
      const plansMap = new Map(
        plans.map(plan => [plan.nome.toLowerCase().trim(), plan.validade])
      );

      // Processar usuários para adicionar informações extras
      const usersWithExtensions = await Promise.all(
        users.map(async (user) => {
          const { count } = await supabase
            .from('extensions')
            .select('*', { count: 'exact', head: true })
            .eq('accountid', user.accountid);

          // Calcular validade do plano apenas para logging
          const planoNormalizado = user.plano?.toLowerCase().trim() || '';
          const validity = plansMap.get(planoNormalizado) || 30;

          if (user.created_at) {
            const now = new Date();
            const createdAt = new Date(user.created_at);
            const expirationDate = new Date(createdAt);
            expirationDate.setDate(createdAt.getDate() + validity);

            const diasRestantes = Math.floor(
              (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Apenas para logging, não altera o banco
            console.log(
              `Status do usuário ${user.name}: ${diasRestantes} dias restantes, valido=${user.valido}`
            );
          } else {
            console.log(`${user.name}: Sem data de criação`);
          }

          return {
            ...user,
            extensions_count: count || 0,
            status: user.status?.toLowerCase() === 'active' || user.status?.toLowerCase() === 'ativo' 
              ? 'active' 
              : 'inactive',
            validity: plansMap.get(user.plano?.toLowerCase().trim()) || 30
          };
        })
      );

      setUsers(usersWithExtensions);
      setPlans(plans);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados dos usuários');
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
    if (!confirm('Tem certeza que deseja excluir este usuário? Todos os ramais associados também serão excluídos.')) {
      return;
    }

    try {
      // Primeiro deleta os ramais associados ao accountid do usuário
      const { error: extensionsError } = await supabase
        .from('extensions')
        .delete()
        .eq('accountid', user.accountid);

      if (extensionsError) {
        console.error('Erro ao excluir ramais:', extensionsError);
        toast.error('Erro ao excluir ramais do usuário');
        return;
      }

      // Depois deleta o usuário
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (userError) throw userError;

      // Atualiza a lista de usuários removendo o usuário deletado
      setUsers(users.filter(u => u.id !== user.id));
      toast.success('Usuário e seus ramais foram excluídos com sucesso');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleBulkActions = async (userIds: string[], action: string, extraData?: any) => {
    try {
      switch (action) {
        case 'delete':
          // Primeiro, precisamos obter os accountids dos usuários selecionados
          const { data: selectedUsers, error: fetchError } = await supabase
            .from('users')
            .select('accountid')
            .in('id', userIds);

          if (fetchError) throw fetchError;

          // Deleta os ramais de todos os usuários selecionados
          const { error: extensionsError } = await supabase
            .from('extensions')
            .delete()
            .in('accountid', selectedUsers.map(user => user.accountid));

          if (extensionsError) {
            console.error('Erro ao excluir ramais:', extensionsError);
            toast.error('Erro ao excluir ramais dos usuários');
            return;
          }

          // Depois deleta os usuários
          const { error: usersError } = await supabase
            .from('users')
            .delete()
            .in('id', userIds);

          if (usersError) throw usersError;

          // Atualiza a lista de usuários removendo os usuários deletados
          setUsers(users.filter(user => !userIds.includes(user.id)));
          toast.success(`${userIds.length} usuário(s) e seus ramais foram excluídos com sucesso`);
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
          if (!extraData?.planId) {
            toast.error('Plano não selecionado');
            return;
          }
          
          // Garantir que o planId seja uma string
          const planoString = String(extraData.planId);
          
          const { error: planError } = await supabase
            .from('users')
            .update({ plano: planoString })
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

  const handleRenovarPlano = async (user: AdminUser) => {
    try {
      // Buscar a validade do plano atual
      const { data: planoData, error: planoError } = await supabase
        .from('planos')
        .select('validade')
        .eq('nome', user.plano)
        .single();

      if (planoError) throw planoError;

      if (!planoData) {
        toast.error('Plano não encontrado');
        return;
      }

      // Calcular a nova data de registro
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Atualizar o usuário com a nova data de registro
      const { error: updateError } = await supabase
        .from('users')
        .update({
          created_at: hoje.toISOString(),
          status: 'active' // Garantir que o usuário fique ativo ao renovar
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success(`Plano renovado com sucesso para ${user.name}`);
      fetchData(); // Recarregar os dados
    } catch (error) {
      console.error('Erro ao renovar plano:', error);
      toast.error('Erro ao renovar plano');
    }
  };

  // Filtered users based on search, filters and expired status
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Verificar se o usuário está vencido
      const isExpired = (() => {
        if (!showExpired) return true;
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
        user.accountid?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === '' || user.status === selectedStatus;
      const matchesPlan = selectedPlan === '' || user.plano === selectedPlan;

      return matchesSearch && matchesStatus && matchesPlan && (showExpired ? isExpired : true);
    });
  }, [users, searchTerm, selectedStatus, selectedPlan, showExpired, plans]);

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  // Resetar página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPlan, showExpired]);

  return (
    <div className="min-h-screen bg-gray-50/30 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os usuários do sistema, seus planos e status
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={`p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors ${
              refreshing ? 'animate-spin' : ''
            }`}
            disabled={refreshing}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-lg hover:from-violet-700 hover:to-violet-600 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStats users={users} />

      {/* Main Content */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Carregando usuários...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2 text-red-500">
                <AlertTriangle className="h-8 w-8" />
                <p className="text-sm">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm text-violet-600 hover:text-violet-700"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : (
            <UsersTable
              users={paginatedUsers}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onBulkActions={handleBulkActions}
              onRenovarPlano={handleRenovarPlano}
            />
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> até{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> de{' '}
                <span className="font-medium">{filteredUsers.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {/* Páginas */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      page === currentPage
                        ? 'z-10 bg-violet-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Próxima</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isEditModalOpen && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleUpdateUser}
        />
      )}

      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddUser}
        />
      )}
    </div>
  );
};