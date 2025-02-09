import React from 'react';
import { Phone, PieChart, Clock, BarChart3, CreditCard, Zap } from 'lucide-react';

const features = [
  {
    icon: PieChart,
    title: 'Análise Detalhada',
    description: 'Analisamos suas contas telefônicas para identificar suas tarifas atuais'
  },
  {
    icon: BarChart3,
    title: 'Economia Garantida',
    description: 'Garantimos uma economia de até 80% nas tarifas apresentadas'
  },
  {
    icon: Phone,
    title: 'SIP TRUNK Ilimitado',
    description: 'Ativamos um SIP TRUNK para seu PABX, sem limites de Canais'
  },
  {
    icon: Clock,
    title: 'Painel em Tempo Real',
    description: 'Controle todos os custos com relatórios em tempo real'
  },
  {
    icon: CreditCard,
    title: 'Pagamento Pré-pago',
    description: 'Maior controle com sistema de pagamento pré-pago'
  },
  {
    icon: Zap,
    title: 'Ativação Rápida',
    description: 'Disponibilização em até 12 horas após a contratação'
  }
];

const SipTrunkSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Sip Trunk
          </h2>
          <h3 className="text-2xl font-semibold mb-4 text-secondary-light">
            Sip Trunk Inova: qualidade e economia para sua empresa!
          </h3>
          <p className="text-lg text-white/80 mb-8">
            Analisamos todas as contas telefônicas da sua empresa, e conseguiremos tarifas super agressivas para que consiga economizar até 80% em suas contas telefônicas!
          </p>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
            <p className="text-white/90 italic">
              "Deixe sua conta telefônica, com a Inova, que atua nesse mercado a mais de 20 anos!"
            </p>
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center mb-12 text-white">Como funciona?</h3>
          <p className="text-lg text-white/80 text-center max-w-3xl mx-auto mb-16">
            Você sabia que pode ter total controle do quanto você gasta com a sua telefonia? Sim! E além disso, com o nosso painel inteligente, você ainda gera relatórios com informações detalhadas sobre cada uma de suas ligações. Ah, e se precisar de ter acesso às gravações das ligações, elas estão a um clique. Assim, você garante a qualidade do atendimento ao cliente.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-secondary/30 transition-all duration-300 group"
              >
                <feature.icon className="h-10 w-10 text-secondary-light mb-4 group-hover:text-secondary transition-colors" />
                <h4 className="text-xl font-semibold mb-2 text-white">{feature.title}</h4>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button className="bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Solicitar Análise Gratuita
          </button>
        </div>
      </div>
    </section>
  );
};

export default SipTrunkSection;