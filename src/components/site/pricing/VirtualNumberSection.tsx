import React from 'react';
import { MapPin, Shield, PhoneForwarded, Layers, Clock, Check } from 'lucide-react';

const benefits = [
  {
    icon: MapPin,
    title: 'Cobertura Nacional',
    description: 'Mais de 1.800 cidades cobertas através das principais operadoras'
  },
  {
    icon: Shield,
    title: 'Qualidade e Estabilidade',
    description: 'Infraestrutura robusta garantindo alta disponibilidade'
  },
  {
    icon: PhoneForwarded,
    title: 'Portabilidade',
    description: 'Mantenha seu número atual com nossa portabilidade numérica'
  },
  {
    icon: Layers,
    title: 'Números Multicanais',
    description: 'Gerencie múltiplos canais de comunicação simultaneamente'
  }
];

const VirtualNumberSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/20 rounded-full filter blur-[100px]"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-light/20 rounded-full filter blur-[100px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Por que contratar um número virtual com a Inova?
          </h2>
          <p className="text-lg text-white/80">
            Temos a maior cobertura nacional de Números Virtuais, pois possuímos interconexão com as principais operadoras de Telefonia do País, garantindo assim, alta disponibilidade de cobertura.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-secondary/30 transition-all duration-300 group"
            >
              <benefit.icon className="h-10 w-10 text-secondary-light mb-4 group-hover:text-secondary transition-colors" />
              <h4 className="text-xl font-semibold mb-2 text-white">{benefit.title}</h4>
              <p className="text-white/70">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold mb-4 text-white">Nossos Planos</h3>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Todos os nossos planos não possuem fidelidade. Você pode portar seu número receptivo para o Inova, ou se preferir, pode escolher um de nossos planos Atende que incluem um novo número Receptivo.
          </p>
        </div>

        {/* Featured Plan Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-secondary/30 transition-all duration-300">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold text-white mb-2">Atende 3 DID</h4>
              <p className="text-white/70">Essencial para times que estão iniciando</p>
            </div>

            <div className="flex justify-center items-baseline mb-8">
              <span className="text-4xl font-bold text-white">R$</span>
              <span className="text-6xl font-bold text-white">39</span>
              <span className="text-2xl font-bold text-white">,90</span>
              <span className="text-white/70 ml-2">/mensal</span>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Número Virtual com 3 Canais simultâneos',
                'Ativação única de R$49,90',
                'Aceita Portabilidade numérica',
                'Sem custos pare receber chamadas',
                'Tarifa Local nas ligações'
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-3 text-white/80">
                  <Check className="h-5 w-5 text-secondary-light flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button className="w-full bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary text-white py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
              Contratar Agora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualNumberSection;