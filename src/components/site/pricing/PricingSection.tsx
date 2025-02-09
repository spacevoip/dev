import React from 'react';
import PricingCard from './PricingCard';

const plans = [
  {
    name: 'Sip Trial',
    price: '0.00',
    isPopular: false,
    features: [
      'Limite de 3 ramais',
      'Validade de 1 dia',
      'Gravação avançada',
      'Minutos ilimitados'
    ]
  },
  {
    name: 'Sip Basico',
    price: '800.00',
    isPopular: true,
    features: [
      'Limite de 5 ramais',
      'Validade de 20 dias',
      'Minutos ilimitados',
      'Gravação avançada',
      'Relatórios detalhados'
    ]
  },
  {
    name: 'Sip Premium',
    price: '1000.00',
    isPopular: false,
    features: [
      'Limite de 13 ramais',
      'Validade de 25 dias',
      'Minutos ilimitados',
      'Gravação avançada',
      'Relatórios detalhados'
    ]
  },
  {
    name: 'Sip Exclusive',
    price: '1400.00',
    isPopular: false,
    features: [
      'Limite de 15 ramais',
      'Validade de 25 dias',
      'Minutos ilimitados',
      'Gravação avançada',
      'Relatórios detalhados'
    ]
  }
];

const PricingSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Assinaturas & Planos
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Escolha o melhor plano para sua empresa e aproveite todos os recursos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-secondary/30 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-primary-light/30 rounded-full filter blur-3xl opacity-20"></div>
          
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;