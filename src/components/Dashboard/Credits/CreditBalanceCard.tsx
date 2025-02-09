import React from 'react';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

export const CreditBalanceCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Saldo de Créditos</h3>
        </div>
      </div>
      
      <div className="flex flex-col items-start">
        <div className="bg-white w-full rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Créditos Disponíveis</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(1250)}</p>
        </div>
      </div>
    </div>
  );
};