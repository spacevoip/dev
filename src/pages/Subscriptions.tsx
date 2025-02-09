import React from 'react';
import { Ticket, Check } from 'lucide-react';

const plans = [
  {
    name: 'Básico',
    price: 49.90,
    features: [
      'Até 5 ramais',
      '1000 minutos/mês',
      'Suporte por email',
      'Gravação básica',
    ],
  },
  {
    name: 'Profissional',
    price: 99.90,
    features: [
      'Até 20 ramais',
      '5000 minutos/mês',
      'Suporte prioritário',
      'Gravação avançada',
      'Relatórios detalhados',
    ],
    popular: true,
  },
  {
    name: 'Empresarial',
    price: 199.90,
    features: [
      'Ramais ilimitados',
      'Minutos ilimitados',
      'Suporte 24/7',
      'Gravação ilimitada',
      'Relatórios personalizados',
      'API de integração',
    ],
  },
];

export const Subscriptions = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Ticket className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Assinaturas & Planos</h1>
          <p className="text-gray-600">Escolha o melhor plano para sua empresa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-xl shadow-sm border ${
              plan.popular ? 'border-blue-500 shadow-blue-100' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  Mais Popular
                </span>
              </div>
            )}

            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</span>
                <span className="text-gray-500 ml-2">/mês</span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full mt-6 px-4 py-2 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Assinar Plano
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};