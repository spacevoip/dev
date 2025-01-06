import React from 'react';
import { MapPin } from 'lucide-react';

const CoverageSection = () => {
  return (
    <section className="py-20 bg-white/5">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block p-3 bg-white/10 rounded-2xl mb-8">
            <MapPin className="w-8 h-8 text-secondary-light" />
          </div>
          
          <h2 className="text-3xl font-bold mb-6 text-white">
            Mapa de cobertura
          </h2>
          
          <p className="text-lg text-white/80 mb-8">
            Confira as cidades com cobertura para portabilidade e contratação de números novos
          </p>
          
          <button className="bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary text-white px-8 py-3 rounded-lg font-medium transition-all duration-300">
            Conferir Disponibilidade
          </button>
        </div>
      </div>
    </section>
  );
};

export default CoverageSection;