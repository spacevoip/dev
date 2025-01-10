import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, UserCheck, UserX, Package, X, Eye } from 'lucide-react';
import { AdminUser } from '../../../pages/admin/Users';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  documento: string;
  status: string;
  plano: string;
  contato?: string;
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
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onEdit,
  onDelete,
  onBulkActions,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<AdminUser | null>(null);
  const [showPlanSelector, setShowPlanSelector] = useState(false);

  // Lista de planos disponíveis
  const availablePlans = [
    { id: 'sip_trial', name: 'Sip Trial', validity: 1 },
    { id: 'sip_basico', name: 'Sip Básico', validity: 20 },
    { id: 'sip_premium', name: 'Sip Premium', validity: 25 },
    { id: 'sip_exclusive', name: 'Sip Exclusive', validity: 25 },
  ];

  const handleBulkAction = (action: string) => {
    if (action === 'plan') {
      setShowPlanSelector(true);
      setShowActions(false);
      return;
    }

    if (action === 'delete') {
      if (window.confirm(`Tem certeza que deseja excluir ${selectedUsers.length} usuário(s)?`)) {
        onBulkActions(selectedUsers, 'delete');
        toast.success(`${selectedUsers.length} usuário(s) excluído(s) com sucesso`);
        setShowActions(false);
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
    setShowActions(false);
    setSelectedUsers([]);
  };

  const handlePlanChange = (planId: string) => {
    onBulkActions(selectedUsers, 'plan', { planId });
    toast.success(`Plano alterado para ${selectedUsers.length} usuário(s) com sucesso`);
    setShowPlanSelector(false);
    setSelectedUsers([]);
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
      setSelectedUsers(prev => {
        const newSelection = [...prev, userId];
        toast.info(`${newSelection.length} usuário(s) selecionado(s)`);
        return newSelection;
      });
    } else {
      setSelectedUsers(prev => {
        const newSelection = prev.filter(id => id !== userId);
        if (newSelection.length === 0) {
          toast.info('Seleção limpa');
        } else {
          toast.info(`${newSelection.length} usuário(s) selecionado(s)`);
        }
        return newSelection;
      });
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

  const bulkActions = [
    {
      label: 'Excluir selecionados',
      value: 'delete',
      icon: Trash2,
      className: 'text-red-600 hover:bg-red-50',
    },
    {
      label: 'Ativar usuários',
      value: 'activate',
      icon: UserCheck,
      className: 'text-green-600 hover:bg-green-50',
    },
    {
      label: 'Desativar usuários',
      value: 'deactivate',
      icon: UserX,
      className: 'text-orange-600 hover:bg-orange-50',
    },
    {
      label: 'Alterar plano',
      value: 'plan',
      icon: Package,
      className: 'text-blue-600 hover:bg-blue-50',
    },
  ];

  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

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

  const calculateExpirationInfo = (user: AdminUser) => {
    const createdDate = new Date(user.created_at);
    const validity = getValidityDays(user.plano);
    const expirationDate = new Date(createdDate);
    expirationDate.setDate(createdDate.getDate() + validity);
    const now = new Date();
    const isExpired = expirationDate < now;
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      expirationDate: expirationDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      isExpired,
      daysUntilExpiration,
    };
  };

  const getValidityDays = (plano: string): number => {
    const planoNormalizado = plano.toLowerCase().trim();
    switch (planoNormalizado) {
      case 'sip trial':
        return 1;
      case 'sip basico':
        return 20;
      case 'sip premium':
      case 'sip exclusive':
        return 25;
      default:
        return 30; // fallback padrão
    }
  };

  return (
    <div className="space-y-4">
      {/* Modal de Seleção de Plano */}
      {showPlanSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Novo Plano</h3>
              <button
                onClick={() => setShowPlanSelector(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {availablePlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handlePlanChange(plan.id)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-lg group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-violet-500 group-hover:text-violet-600" />
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-violet-600">
                        {plan.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Validade: {plan.validity} dias
                      </p>
                    </div>
                  </div>
                  <div className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Usuários</h2>
              {selectedUsers.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                  {selectedUsers.length} selecionado(s)
                </span>
              )}
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setSelectedUsers([])}
                >
                  Limpar seleção
                </button>
                <div className="relative">
                  <button
                    className="px-3 py-1.5 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-md transition-colors flex items-center gap-2"
                    onClick={() => setShowActions(!showActions)}
                  >
                    Ações em massa
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {showActions && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                      <div className="py-1">
                        {bulkActions.map((action) => (
                          <button
                            key={action.value}
                            onClick={() => handleBulkAction(action.value)}
                            className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 hover:bg-gray-50 ${action.className}`}
                          >
                            <action.icon className="h-4 w-4" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someSelected && !allSelected;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nome
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Documento
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Plano
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ramais
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Validade
                </th>
                <th scope="col" className="relative px-4 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.documento || '-'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.plano}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.extensions_count || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusDisplay(user.status).className
                    }`}>
                      {getStatusDisplay(user.status).text}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {calculateExpirationInfo(user).expirationDate}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleShowDetails(user)}
                        className="text-violet-600 hover:text-violet-900 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(user)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Usuário */}
      {selectedUserDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-violet-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-semibold text-violet-800">
                    {selectedUserDetails.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUserDetails.name}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {selectedUserDetails.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Pessoais */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                      Informações Pessoais
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-gray-500 uppercase">Nome Completo</label>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedUserDetails.name}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase">Email</label>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedUserDetails.email}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase">Telefone</label>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {selectedUserDetails.contato || 'Não informado'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase">CPF/CNPJ</label>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedUserDetails.documento}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações da Conta */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                      Informações da Conta
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-gray-500 uppercase">Status</label>
                        <span
                          className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusDisplay(selectedUserDetails.status).className
                          }`}
                        >
                          {getStatusDisplay(selectedUserDetails.status).text}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase">Plano Atual</label>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedUserDetails.plano}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase">Data de Criação</label>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {new Date(selectedUserDetails.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase">Data de Vencimento</label>
                        {(() => {
                          // Função para obter os dias de validade baseado no plano
                          const getValidityDays = (plano: string): number => {
                            const planoNormalizado = plano.toLowerCase().trim();
                            switch (planoNormalizado) {
                              case 'sip trial':
                                return 1;
                              case 'sip basico':
                                return 20;
                              case 'sip premium':
                              case 'sip exclusive':
                                return 25;
                              default:
                                return 30; // fallback padrão
                            }
                          };
                          
                          // Garantir que created_at é uma data válida
                          const createdDate = new Date(selectedUserDetails.created_at);
                          if (isNaN(createdDate.getTime())) {
                            return (
                              <p className="mt-1 text-sm font-medium text-gray-500">
                                Data de criação inválida
                              </p>
                            );
                          }

                          // Obter a validade baseada no plano
                          const validity = getValidityDays(selectedUserDetails.plano);
                          const expirationDate = new Date(createdDate);
                          expirationDate.setDate(createdDate.getDate() + validity);
                          
                          // Verificar se a data de expiração é válida
                          if (isNaN(expirationDate.getTime())) {
                            return (
                              <p className="mt-1 text-sm font-medium text-gray-500">
                                Erro ao calcular data de vencimento
                              </p>
                            );
                          }

                          const now = new Date();
                          const isExpired = expirationDate < now;
                          const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          
                          return (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${
                                  isExpired ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {expirationDate.toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isExpired
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {isExpired ? 'Vencido' : 'Ativo'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className={`text-xs ${
                                  isExpired
                                    ? 'text-red-600'
                                    : daysUntilExpiration <= 5
                                    ? 'text-yellow-600'
                                    : 'text-gray-500'
                                }`}>
                                  {isExpired
                                    ? `Vencido há ${Math.abs(daysUntilExpiration)} dias`
                                    : daysUntilExpiration === 0
                                    ? 'Vence hoje'
                                    : daysUntilExpiration === 1
                                    ? 'Vence amanhã'
                                    : `Vence em ${daysUntilExpiration} dias`}
                                </p>
                                <span className="text-xs text-gray-500">
                                  (Plano de {validity} dias)
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  onEdit(selectedUserDetails);
                  setSelectedUserDetails(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Editar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
