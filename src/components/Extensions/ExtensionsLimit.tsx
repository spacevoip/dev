import React from 'react';
import { useExtensionsCount } from '../../hooks/useExtensionsCount';
import { RefreshCw } from 'lucide-react';

interface ExtensionsLimitProps {
  showProgressBar?: boolean;
  className?: string;
}

export const ExtensionsLimit: React.FC<ExtensionsLimitProps> = ({ 
  showProgressBar = true,
  className = ''
}) => {
  const { currentCount, planLimit, loading, error } = useExtensionsCount();

  if (error) {
    return (
      <div className={`text-red-600 ${className}`}>
        Erro ao carregar informações dos ramais
      </div>
    );
  }

  const isAtLimit = currentCount >= planLimit;
  const percentage = Math.min((currentCount / planLimit) * 100, 100);

  return (
    <div className={`${className} transition-opacity duration-200 ${loading ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Limite de Ramais</h2>
        {loading && (
          <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900">
          {currentCount}/{planLimit}
        </span>
        <span className="text-sm text-gray-500">ramais usados</span>
      </div>

      {showProgressBar && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                isAtLimit ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(percentage)}% utilizado</span>
            <span>{planLimit - currentCount} disponíveis</span>
          </div>
        </div>
      )}

      {isAtLimit && (
        <div className="mt-2 text-sm text-red-600">
          Você atingiu o limite de ramais do seu plano.
        </div>
      )}
    </div>
  );
};
