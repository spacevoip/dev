import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  LogIn,
  X 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface User {
  id: string;
  name: string;
  email: string;
  contato: string;
  accountid: string;
  plano: string;
  created_at: string;
  last_login?: string;
  documento?: string;
}

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user === selectedUser ? null : user);
  };

  const renderUserDetailsCard = () => {
    if (!selectedUser) return null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedUser(null);
          }
        }}
      >
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="relative bg-gray-50 p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h2>
                  <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Informações Pessoais */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Informações Pessoais</h3>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="text-gray-900">{selectedUser.contato}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">CPF/CNPJ</p>
                    <p className="text-gray-900">{selectedUser.documento || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              {/* Informações da Conta */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Informações da Conta</h3>

                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Account ID</p>
                    <p className="text-gray-900">{selectedUser.accountid}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Data de Cadastro</p>
                    <p className="text-gray-900">
                      {selectedUser.created_at 
                        ? format(new Date(selectedUser.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) 
                        : 'Não disponível'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <LogIn className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Último Acesso</p>
                    <p className="text-gray-900">
                      {selectedUser.last_login 
                        ? format(new Date(selectedUser.last_login), 'dd/MM/yyyy HH:mm', { locale: ptBR }) 
                        : 'Nunca acessou'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 flex justify-end space-x-3">
            <button
              onClick={() => setSelectedUser(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => onEdit(selectedUser)}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr 
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`cursor-pointer hover:bg-gray-50 transition ${
                selectedUser?.id === user.id ? 'bg-blue-50' : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.contato}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.accountid}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {user.plano}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(user);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderUserDetailsCard()}
    </div>
  );
};
