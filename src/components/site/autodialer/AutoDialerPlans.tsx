import React from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Combo Free Call Center 500',
    price: '259,40',
    description: 'Essencial para times que estão iniciando',
    features: [
      '5 Ramais',
      '500 minutos grátis para fixo e móvel no Brasil',
      '15 Ligações simultâneas ativas',
      '5 Ligações receptivas',
      '1 Número virtual (novo ou portado) com 3 canais simultâneos'
    ]
  },
  {
    name: 'Combo Free Call Center 1000',
    price: '299,70',
    description: 'A solução para equipes em crescimento',
    features: [
      '5 Ramais',
      '1000 minutos grátis para fixo e móvel no Brasil',
      '15 Ligações simultâneas ativas',
      '5 Ligações receptivas',
      '1 Número virtual (novo ou portado) com 3 canais simultâneos'
    ]
  },
  {
    name: 'Combo Free Call Center 3000',
    price: '459,50',
    description: 'Ideal para empresas consolidadas',
    features: [
      '5 Ramais',
      '3000 minutos grátis para fixo e móvel no Brasil',
      '15 Ligações simultâneas ativas',
      '5 Ligações receptivas',
      '1 Número virtual (novo ou portado) com 3 canais simultâneos'
    ]
  },
  {
    name: 'Combo Free Call Center 5000',
    price: '619,90',
    description: 'Para organizações com alto volume de atendimento',
    features: [
      '5 Ramais',
      '5000 minutos grátis para fixo e móvel no Brasil',
      '15 Ligações simultâneas ativas',
      '5 Ligações receptivas',
      '1 Número virtual (novo ou portado) com 3 canais simultâneos'
    ]
  }
];

const AutoDialerPlans = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Nossos Planos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-secondary/30 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-white/70 mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">R$ {plan.price}</span>
                <span className="text-white/60">/mensal</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-secondary-light flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full py-3 px-6 bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary text-white rounded-lg font-medium transition-all duration-300">
                Contratar Agora
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AutoDialerPlans;