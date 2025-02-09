import React from 'react';
import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

const PricingCard = ({ name, price, features, isPopular = false }: PricingCardProps) => {
  return (
    <div className={`relative rounded-2xl backdrop-blur-lg transition-all duration-300 hover:transform hover:-translate-y-2 ${
      isPopular 
        ? 'bg-gradient-to-b from-white via-white to-white/95 shadow-xl shadow-secondary/20 text-gray-800' 
        : 'bg-white/10 text-white border border-white/20'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-secondary to-secondary-light text-white text-sm font-medium px-4 py-1 rounded-full shadow-lg">
            Mais Popular
          </span>
        </div>
      )}

      <div className="p-8">
        <h3 className={`text-xl font-bold mb-4 ${isPopular ? 'text-gray-800' : 'text-white'}`}>
          {name}
        </h3>
        
        <div className="mb-6">
          <span className="text-3xl font-bold">R$ {price}</span>
          <span className={`${isPopular ? 'text-gray-600' : 'text-white/60'}`}>/mês</span>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-3">
              <Check className={`h-5 w-5 ${isPopular ? 'text-secondary' : 'text-secondary-light'}`} />
              <span className={`${isPopular ? 'text-gray-600' : 'text-white/80'}`}>{feature}</span>
            </li>
          ))}
        </ul>

        <button className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
          isPopular 
            ? 'bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary text-white shadow-lg hover:shadow-xl' 
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}>
          Começar agora
        </button>
      </div>
    </div>
  );
};

export default PricingCard;