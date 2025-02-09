import React from 'react';
import { Phone, Calculator, Users } from 'lucide-react';
import StatCard from './StatCard';

const StatsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-gray-50">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full filter blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full filter blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Conectar com seus clientes nunca foi tão fácil e eficiente
          </h2>
          <p className="text-lg text-gray-600">
            Nós somos uma equipe apaixonada por conectar pessoas e empresas de maneira 
            personalizada e inovadora. E o melhor de tudo: podemos ajudar a sua empresa a 
            alcançar novos patamares de satisfação do cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard
            value="+35.9 milhões"
            label="Chamadas mensais efetuadas"
            Icon={Phone}
          />
          <StatCard
            value="+23.3 mil"
            label="Ramais ativos na plataforma"
            Icon={Calculator}
          />
          <StatCard
            value="+2.6 mil"
            label="Clientes ativos na InovaVoip"
            Icon={Users}
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;