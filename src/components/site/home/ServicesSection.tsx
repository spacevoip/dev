import React from 'react';
import { Phone, PhoneCall, Headphones, Users, MessageSquare, Bot, Smartphone, PhoneForwarded, PhoneIncoming, ShoppingCart, Network } from 'lucide-react';
import ServiceCard from './ServiceCard';

const services = [
  {
    icon: Phone,
    title: 'PABX em Nuvem',
    link: '#',
  },
  {
    icon: PhoneCall,
    title: 'PABX em Nuvem Ilimitado',
    link: '#',
  },
  {
    icon: Headphones,
    title: 'Call Center em Nuvem',
    link: '#',
  },
  {
    icon: Users,
    title: 'Terceirização de Tele Atendimento',
    link: '#',
  },
  {
    icon: MessageSquare,
    title: 'InovaVoip Omnichannel',
    link: '#',
  },
  {
    icon: Bot,
    title: 'Automação com o Xbot',
    link: '#',
  },
  {
    icon: Smartphone,
    title: 'Números Virtuais',
    link: '#',
  },
  {
    icon: PhoneForwarded,
    title: 'Envio de SMS',
    link: '#',
  },
  {
    icon: PhoneIncoming,
    title: 'Números 0800',
    link: '#',
  },
  {
    icon: Phone,
    title: 'Números 4003',
    link: '#',
  },
  {
    icon: ShoppingCart,
    title: 'Equipamentos',
    link: '#',
  },
  {
    icon: Network,
    title: 'SIP Trunk Ativo',
    link: '#',
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Serviços que irão profissionalizar a gestão
          </h2>
          <h3 className="text-xl md:text-2xl text-gray-600">
            e atendimento da sua empresa
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              link={service.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;