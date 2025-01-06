import React from 'react';
import { useExtensionsCount } from '../../hooks/useExtensionsCount';

interface ExtensionsLimitProps {
  showProgressBar?: boolean;
  className?: string;
}

export const ExtensionsLimit: React.FC<ExtensionsLimitProps> = ({ 
  showProgressBar = true,
  className = ''
}) => {
  const { currentCount, planLimit, loading } = useExtensionsCount();

  if (loading) {
    return (
      <div className={`text-gray-500 ${className}`}>
        Carregando informações...
      </div>
    );
  }

  const isAtLimit = currentCount >= planLimit;
  const percentage = Math.min((currentCount / planLimit) * 100, 100);

  return (
    <div className={className}>
      <h2 className="text-lg font-medium mb-2">Limite de Ramais</h2>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900">
          {currentCount}/{planLimit}
        </span>
        <span className="text-sm text-gray-500">ramais usados</span>
      </div>
      
      <p className="text-sm text-gray-500 mt-1">
        Este é o limite de ramais no seu plano atual.
      </p>

      {isAtLimit && (
        <p className="text-sm text-red-600 mt-1">
          Você atingiu o limite de ramais do seu plano.
        </p>
      )}

      {showProgressBar && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              isAtLimit ? 'bg-red-600' : 'bg-blue-600'
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};
