import React, { useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { usePlanPrices } from '../hooks/usePlanPrices';
import { PlanCard } from '../components/Plans/PlanCard';
import { Toast } from '../components/ui/Toast';
import PurchasePlanModal from '../components/Plans/PurchasePlanModal';
import { Plan } from '../types/Plan';

const plans: Plan[] = [
  {
    id: 'trial',
    name: 'Sip Trial',
    extensionsLimit: 3,
    validity: 1,
    features: [
      'Limite de 3 ramais',
      'Validade de 1 dia',
      'Gravação básica',
      'Minutos ilimitados',
    ],
  },
  {
    id: 'basic',
    name: 'Sip Basico',
    extensionsLimit: 5,
    validity: 20,
    features: [
      'Limite de 5 ramais',
      'Validade de 20 dias',
      'Minutos ilimitados',
      'Gravação básica',
      'Relatórios detalhados',
    ],
  },
  {
    id: 'premium',
    name: 'Sip Premium',
    extensionsLimit: 13,
    validity: 25,
    isPopular: true,
    features: [
      'Limite de 13 ramais',
      'Validade de 25 dias',
      'Minutos ilimitados',
      'Gravação básica',
      'Relatórios detalhados',
    ],
  },
  {
    id: 'exclusive',
    name: 'Sip Exclusive',
    extensionsLimit: 15,
    validity: 25,
    features: [
      'Limite de 15 ramais',
      'Validade de 25 dias',
      'Minutos ilimitados',
      'Gravação básica',
      'Relatórios detalhados',
    ],
  },
];

export default function Plans() {
  const { currentUser, loading: userLoading } = useCurrentUser();
  const { prices, loading: pricesLoading } = usePlanPrices();
  const [showToast, setShowToast] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const loading = pricesLoading || userLoading;

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  const handlePaymentSuccess = () => {
    // Recarrega a página para atualizar os dados do plano
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Toast
        message="Para realizar o upgrade do seu plano, entre em contato com nossa equipe de suporte. Teremos prazer em ajudar você a escolher a melhor opção para sua empresa."
        type="info"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Assinaturas & Planos
        </h1>
        <p className="mt-3 text-base leading-7 text-gray-600">
          Escolha o melhor plano para sua empresa e aproveite todos os recursos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg ${
              plan.isPopular ? 'border-2 border-blue-500 scale-[1.02]' : 'border border-gray-200'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-1.5 rounded-full font-medium shadow-md flex items-center gap-1.5">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm">Mais Popular</span>
                </div>
              </div>
            )}

            {currentUser?.plano === plan.name && (
              <div className="absolute -top-3 right-4">
                <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
                  Plano Atual
                </span>
              </div>
            )}

            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {loading ? (
                      "R$ ..."
                    ) : (
                      `R$ ${typeof prices[plan.id] === 'number' ? prices[plan.id].toFixed(2) : "..."}`
                    )}
                  </span>
                  <span className="text-gray-500 ml-2 text-sm">/Periodo</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2.5">
                      <div className={`flex-shrink-0 ${plan.isPopular ? 'text-blue-500' : 'text-gray-400'}`}>
                        <Check className="h-5 w-5" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                  currentUser?.plano === plan.name || (plan.id === 'trial' && currentUser?.plano && currentUser.plano !== 'Sip Trial')
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-blue-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
                disabled={currentUser?.plano === plan.name || (plan.id === 'trial' && currentUser?.plano && currentUser.plano !== 'Sip Trial')}
                onClick={() => handleSelectPlan(plan)}
              >
                {currentUser?.plano === plan.name 
                  ? 'Plano Atual' 
                  : plan.id === 'trial' && currentUser?.plano && currentUser.plano !== 'Sip Trial'
                  ? 'Não Disponível'
                  : 'Fazer Upgrade'
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPurchaseModal && selectedPlan && currentUser && (
        <PurchasePlanModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          currentUser={currentUser}
          planPrice={prices[selectedPlan.id] || 0}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
