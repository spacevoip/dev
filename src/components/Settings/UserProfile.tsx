import React from 'react';
import { User } from 'lucide-react';
import { useExtensionsCount } from '../../hooks/useExtensionsCount';

interface UserProfileProps {
  userData: {
    name: string;
    email: string;
    plano?: string;
    created_at: string;
    accountid: string;
    status: string;
    contato?: string;
    documento?: string;
  };
  planData?: {
    id: string;
    nome: string;
    description: string;
    price: number;
    validade: number;
    limite: number;
  };
}

export const UserProfile: React.FC<UserProfileProps> = ({ userData, planData }) => {
  const { currentCount, planLimit, loading: extensionsLoading } = useExtensionsCount();

  if (!userData) {
    return null;
  }

  // Calcula a data de vencimento baseado na data de criação e validade do plano
  const getExpirationDate = () => {
    if (!userData.created_at || !planData?.validade) return null;
    const createdDate = new Date(userData.created_at);
    const expirationDate = new Date(createdDate);
    expirationDate.setDate(createdDate.getDate() + planData.validade);
    return expirationDate;
  };

  const expirationDate = getExpirationDate();
  const isExpired = expirationDate ? new Date() > expirationDate : false;

  return (
    <div className="space-y-6">
      {/* Perfil do Usuário */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Informações do Usuário</h2>
            <p className="text-sm text-gray-600">Gerencie suas informações pessoais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Nome</p>
            <p className="mt-1 text-gray-900">{userData.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-gray-900">{userData.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Telefone / WhatsApp</p>
            <p className="mt-1 text-gray-900">{userData.contato || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">CPF/CNPJ</p>
            <p className="mt-1 text-gray-900">{userData.documento || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Plano Atual</p>
            <p className="mt-1 text-gray-900">{planData?.nome || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Seu Plano Expira em</p>
            {expirationDate ? (
              <p className="mt-1 text-gray-900">
                {expirationDate.toLocaleDateString('pt-BR')}
                {isExpired && (
                  <span className="ml-2 text-sm text-red-600">
                    (Vencido)
                  </span>
                )}
              </p>
            ) : (
              <p className="mt-1 text-gray-500">-</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cliente Desde</p>
            <p className="mt-1 text-gray-900">
              {new Date(userData.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">ID da Conta</p>
            <p className="mt-1 text-gray-900">{userData.accountid}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                userData.status.toLowerCase() === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {userData.status.charAt(0).toUpperCase() + userData.status.slice(1).toLowerCase()}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ramais em Uso</p>
            <p className="mt-1">
              {extensionsLoading ? (
                <span className="text-gray-500">Carregando...</span>
              ) : (
                <span className="text-gray-900">
                  {currentCount} / {planLimit || '-'}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Informações do Plano */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Informações do Plano</h2>
        <div className="space-y-4">
          {extensionsLoading ? (
            <div className="text-gray-500">Carregando informações do plano...</div>
          ) : (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Limite de Ramais</h3>
              <div className="mt-2">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900">{currentCount}/{planData?.limite || planLimit}</span>
                  <span className="ml-2 text-sm text-gray-500">ramais usados</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Este é o limite de ramais no seu plano atual.
                  {currentCount >= (planData?.limite || planLimit) && (
                    <span className="text-red-600 ml-1">
                      Você atingiu o limite de ramais.
                    </span>
                  )}
                </p>
                
                {/* Progress bar */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentCount >= (planData?.limite || planLimit) ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                    style={{
                      width: `${Math.min((currentCount / (planData?.limite || planLimit)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};