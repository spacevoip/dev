import React from 'react';
import { DollarSign } from 'lucide-react';

const AdditionalInfo = () => {
  const additionalFees = [
    'Tarifas excedentes de Fixo para todo o Brasil a R$0,04/minuto',
    'Tarifas excedentes de Móvel para todo o Brasil a R$0,12/minuto',
    'Ramais excedentes a R$39,90 por ramal',
    'Números virtuais excedentes a R$19,90 por número'
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-secondary-light" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Adicionais e Tarifas
              </h2>
            </div>

            <ul className="space-y-4">
              {additionalFees.map((fee, index) => (
                <li key={index} className="text-white/80 pl-4 border-l-2 border-secondary/30">
                  {fee}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdditionalInfo;