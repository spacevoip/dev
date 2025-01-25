import React, { useState } from 'react';
import { Menu } from '@headlessui/react';
import { Edit2, Trash2, MoreVertical, UserCheck, UserX, Package, X, Eye, RefreshCw } from 'lucide-react';
import { AdminUser } from '../../../pages/admin/Users';
import { toast } from 'sonner';
import { calculateExpirationStatus, getExpirationStatusClass, getExpirationStatusText } from '../../../utils/dateUtils';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: string;
  plano: string;
  created_at: string;
  expiration_date?: string;
  validity: number;
  extensions_count: number;
}

interface UsersTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onBulkActions: (userIds: string[], action: string, extraData?: any) => void;
  onRenovarPlano: (user: AdminUser) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onEdit,
  onDelete,
  onBulkActions,
  onRenovarPlano,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<AdminUser | null>(null);
  const [showPlanSelector, setShowPlanSelector] = useState(false);

  const availablePlans = [
    { id: 'SIP TRIAL', name: 'Sip Trial', validity: 1 },
    { id: 'SIP BASICO', name: 'Sip Básico', validity: 20 },
    { id: 'SIP PREMIUM', name: 'Sip Premium', validity: 25 },
    { id: 'SIP EXCLUSIVE', name: 'Sip Exclusive', validity: 25 },
  ];

  const handleBulkAction = (action: string) => {
    try {
      if (selectedUsers.length === 0) {
        toast.error('Selecione pelo menos um usuário');
        return;
      }

      if (action === 'plan') {
        setShowPlanSelector(true);
        return;
      }

      if (action === 'delete') {
        if (window.confirm(`Tem certeza que deseja excluir ${selectedUsers.length} usuário(s)?`)) {
          onBulkActions(selectedUsers, 'delete');
          setSelectedUsers([]);
        }
        return;
      }

      // Para outras ações (ativar/desativar)
      onBulkActions(selectedUsers, action);
      const actionMessages = {
        activate: 'ativado(s)',
        deactivate: 'desativado(s)'
      };
      toast.success(`${selectedUsers.length} usuário(s) ${actionMessages[action]} com sucesso`);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Erro ao executar ação em massa:', error);
      toast.error('Erro ao executar ação em massa');
    }
  };

  const handlePlanChange = (planId: string) => {
    try {
      if (selectedUsers.length === 0) {
        toast.error('Selecione pelo menos um usuário');
        return;
      }

      onBulkActions(selectedUsers, 'plan', { planId });
      toast.success(`Plano alterado para ${selectedUsers.length} usuário(s) com sucesso`);
      setShowPlanSelector(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
      toast.error('Erro ao alterar plano');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allUserIds = users.map(user => user.id);
      setSelectedUsers(allUserIds);
      toast.info(`${users.length} usuários selecionados`);
    } else {
      setSelectedUsers([]);
      toast.info('Seleção limpa');
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleDelete = (user: AdminUser) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      onDelete(user);
      toast.success(`Usuário ${user.name} excluído com sucesso`);
    }
  };

  const handleShowDetails = (user: AdminUser) => {
    setSelectedUserDetails(user);
    toast.info(`Visualizando detalhes de ${user.name}`);
  };

  const handleRenovarPlano = (user: AdminUser) => {
    onRenovarPlano(user);
  };

  const getStatusDisplay = (status: string | undefined) => {
    if (!status) return { text: 'Inativo', className: 'bg-red-100 text-red-800' };
    
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'active':
      case 'ativo':
        return { text: 'Ativo', className: 'bg-green-100 text-green-800' };
      case 'inactive':
      case 'inativo':
        return { text: 'Inativo', className: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Inativo', className: 'bg-red-100 text-red-800' };
    }
  };

  return (
    <div className="relative min-h-[500px]">
      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="sticky top-0 left-0 right-0 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3 shadow-lg mb-4 z-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedUsers.length} usuário(s) selecionado(s)
            </span>
            <button
              onClick={() => setSelectedUsers([])}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              <UserCheck className="h-4 w-4" />
              Ativar
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100"
            >
              <UserX className="h-4 w-4" />
              Desativar
            </button>
            <button
              onClick={() => handleBulkAction('plan')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              <Package className="h-4 w-4" />
              Alterar Plano
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-600"
                  checked={users.length > 0 && selectedUsers.length === users.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Nome
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Validade
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Plano
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Ramais
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const expirationInfo = calculateExpirationStatus(user.created_at, user.validity);
              const statusClass = getExpirationStatusClass(expirationInfo);
              const statusText = getExpirationStatusText(expirationInfo);

              return (
                <tr 
                  key={user.id} 
                  className={`${selectedUsers.includes(user.id) ? 'bg-violet-50' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-600"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    />
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {user.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        user.status?.toLowerCase() === 'active' || user.status?.toLowerCase() === 'ativo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.status?.toLowerCase() === 'active' || user.status?.toLowerCase() === 'ativo' 
                        ? 'Ativo' 
                        : 'Inativo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        expirationInfo.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : expirationInfo.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {statusText}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.plano}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {user.extensions_count}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUserDetails(user)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Menu as="div" className="relative inline-block text-left">
                        <div>
                          <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                            <MoreVertical className="h-4 w-4" />
                          </Menu.Button>
                        </div>

                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => onEdit(user)}
                                  className={`${
                                    active ? 'bg-violet-500 text-white' : 'text-gray-900'
                                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Editar
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleRenovarPlano(user)}
                                  className={`${
                                    active ? 'bg-violet-500 text-white' : 'text-gray-900'
                                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Renovar Plano
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => onDelete(user)}
                                  className={`${
                                    active ? 'bg-red-500 text-white' : 'text-red-700'
                                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Menu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Plan Selector Modal */}
      {showPlanSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Selecione o novo plano
            </h3>
            <div className="space-y-3">
              {availablePlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handlePlanChange(plan.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-violet-500 hover:bg-violet-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                    <p className="text-sm text-gray-500">Validade: {plan.validity} dias</p>
                  </div>
                  <Package className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPlanSelector(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Detalhes do Usuário
              </h3>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Informações Básicas</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nome</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedUserDetails.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedUserDetails.email}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Status e Plano</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status da Conta</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        selectedUserDetails.status === 'active'
                          ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                          : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10'
                      }`}>
                        {selectedUserDetails.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Plano Atual</dt>
                    <dd className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {selectedUserDetails.plano}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status do Plano</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        getExpirationStatusClass(calculateExpirationStatus(selectedUserDetails.created_at, selectedUserDetails.validity))
                      }`}>
                        {getExpirationStatusText(calculateExpirationStatus(selectedUserDetails.created_at, selectedUserDetails.validity))}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedUserDetails(null);
                  onEdit(selectedUserDetails);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
              >
                <Edit2 className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
