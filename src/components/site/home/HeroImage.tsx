import React from 'react';
import { Headphones, Phone, MessageSquare } from 'lucide-react';
import FeatureCard from './FeatureCard';

const HeroImage = () => {
  return (
    <div className="relative group">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/10 to-primary pointer-events-none" />
      
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-light/30 to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
      
      <img 
        src="https://sonax.net.br/wp-content/uploads/2023/06/nova-mulher-hero.png"
        alt="Professional woman with headset"
        className="w-full h-auto relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
      />
      
      <div className="absolute inset-0 flex flex-col justify-center z-20">
        <FeatureCard 
          Icon={Headphones} 
          title="Atendimento Omnichannel"
          className="absolute top-4 left-4 transform hover:scale-105 transition-transform duration-300 hover:shadow-xl"
        />
        <FeatureCard 
          Icon={Phone} 
          title="PABX em Nuvem Ilimitado"
          className="absolute top-1/2 right-4 transform -translate-y-1/2 hover:scale-105 transition-transform duration-300 hover:shadow-xl"
        />
        <FeatureCard 
          Icon={MessageSquare} 
          title="Call Center em Nuvem"
          className="absolute bottom-4 left-4 transform hover:scale-105 transition-transform duration-300 hover:shadow-xl"
        />
      </div>
    </div>
  );
};

export default HeroImage;