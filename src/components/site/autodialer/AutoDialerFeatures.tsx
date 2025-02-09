import React from 'react';
import { Star, Zap, Phone, Cloud, List, Shield } from 'lucide-react';

const features = [
  {
    icon: Star,
    title: 'Qualifique seus contatos',
    description: 'A Ferramenta Lead Score qualifica e filtra os seus contatos acrescentando inteligência a seu discador de chamadas utilizando um banco de dados onde ele consegue ranquear os melhores contatos e fazer um filtro de contatos ruins, resultando em campanhas mais assertivas.'
  },
  {
    icon: Zap,
    title: 'Eficiência e produtividade',
    description: 'Aumente a produtividade de sua equipe com ferramentas automatizadas.'
  },
  {
    icon: Phone,
    title: 'Automação e discagem',
    description: 'Sistema inteligente de discagem automática para otimizar campanhas.'
  },
  {
    icon: Cloud,
    title: 'Solução 100% em Nuvem',
    description: 'Acesse de qualquer lugar, sem necessidade de infraestrutura local.'
  },
  {
    icon: List,
    title: 'Custo-benefício',
    description: 'O melhor custo-benefício do mercado para sua empresa.'
  },
  {
    icon: Shield,
    title: 'Segurança e confiabilidade',
    description: 'Dados seguros e sistema confiável para suas operações.'
  }
];

const AutoDialerFeatures = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Por que contratar o InovaVoip Call Center Virtual para sua empresa?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-secondary/30 transition-all duration-300"
            >
              <feature.icon className="h-10 w-10 text-secondary-light mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AutoDialerFeatures;