import React, { useState } from 'react';
import { CreditCard, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { UserProfileProps } from '../../../types/settings';
import { useExtensionsCount } from '../../../hooks/useExtensionsCount';
import PurchasePlanModal from '../../Plans/PurchasePlanModal';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { Plan } from '../../../types/Plan';
import { calculateExpirationStatus } from '../../../utils/dateUtils';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserDataQuery } from '../../../hooks/queries/useUserDataQuery';
import { usePlanQuery } from '../../../hooks/queries/usePlanQuery';
import { useNavigate } from 'react-router-dom';

export const PlanInfoCard = () => {
  const { currentCount } = useExtensionsCount();
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { user } = useAuth();
  const { data: userData, isLoading: isLoadingUser } = useUserDataQuery(user?.accountid);
  const { data: planData, isLoading: isLoadingPlan } = usePlanQuery(userData?.plano);

  if (isLoadingUser || isLoadingPlan) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!userData || !planData) {
    return (
      <div className="text-center text-gray-500 py-4">
        Não foi possível carregar as informações do plano.
      </div>
    );
  }

  // Usar a função calculateExpirationStatus para verificar vencimento
  const expirationInfo = userData.created_at && planData.validade 
    ? calculateExpirationStatus(userData.created_at, planData.validade)
    : null;

  const extensionsUsage = planData ? (currentCount / planData.limite) * 100 : 0;

  const handlePlanAction = () => {
    navigate('/plans');
  };

  const handlePaymentSuccess = () => {
    // Recarregar os dados do usuário após o pagamento
    window.location.reload();
  };

  // Converter o planData para o formato esperado pelo PurchasePlanModal
  const convertedPlan: Plan = planData ? {
    id: planData.id,
    name: planData.nome,
    extensionsLimit: planData.limite,
    validity: planData.validade,
    features: planData.features || [],
  } : {
    id: '',
    name: '',
    extensionsLimit: 0,
    validity: 0,
    features: [],
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-50 rounded-lg">
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-900">
              {planData?.nome || 'Plano não encontrado'}
            </h2>
            <p className="text-sm text-gray-500">{planData?.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Uso de Extensões */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Uso de Extensões</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {currentCount} / {planData?.limite || '-'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  extensionsUsage >= 90 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(extensionsUsage, 100)}%` }}
              />
            </div>
          </div>

          {/* Data de Vencimento */}
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Vencimento do Plano</p>
              <p className={`mt-1 ${expirationInfo?.isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                {expirationInfo ? (
                  <>
                    {expirationInfo.formattedDate}
                    <span className="ml-1 text-sm">
                      ({expirationInfo.statusText})
                    </span>
                  </>
                ) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Recursos do Plano */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Recursos Incluídos</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-600">
                Até {planData?.limite || '-'} extensões
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-600">
                Validade de {planData?.validade || '-'} dias
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Suporte técnico incluso</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Valor do Plano</p>
            <p className="text-2xl font-semibold text-gray-900">
              {planData?.valor ? `R$ ${planData.valor.toFixed(2)}` : '-'}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePlanAction}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              expirationInfo?.isExpired 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {expirationInfo?.isExpired ? 'Renovar Plano' : 'Alterar Plano'}
          </button>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {showPurchaseModal && planData && currentUser && (
        <PurchasePlanModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          plan={convertedPlan}
          currentUser={currentUser}
          planPrice={planData.valor || 0}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
