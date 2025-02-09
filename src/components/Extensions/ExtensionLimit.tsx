import React from 'react';
import { useExtensionLimit } from '../../hooks/useExtensionLimit';

export const ExtensionLimit = () => {
  const { currentCount, limit, loading } = useExtensionLimit();

  if (loading) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Limite de Ramais</h3>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900">{currentCount}/{limit}</span>
        <span className="text-sm text-gray-500">ramais usados</span>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Este é o limite de ramais no seu plano atual.
        {currentCount >= limit && (
          <span className="text-red-600 ml-1">
            Você atingiu o limite de ramais.
          </span>
        )}
      </p>
      
      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${
            currentCount >= limit ? 'bg-red-600' : 'bg-blue-600'
          }`}
          style={{
            width: `${Math.min((currentCount / limit) * 100, 100)}%`,
          }}
        ></div>
      </div>
    </div>
  );
};
