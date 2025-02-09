import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyInput } from './CurrencyInput';

interface RechargeFormProps {
  onSubmit: (amount: number) => void;
}

export const RechargeForm: React.FC<RechargeFormProps> = ({ onSubmit }) => {
  const [amount, setAmount] = useState('');
  const MIN_AMOUNT = 250;
  const MAX_AMOUNT = 2000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
    if (numericAmount >= MIN_AMOUNT && numericAmount <= MAX_AMOUNT) {
      onSubmit(numericAmount);
    }
  };

  const getAmountValidationMessage = () => {
    if (!amount) return null;
    const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
    if (numericAmount < MIN_AMOUNT) {
      return `Valor mínimo: ${formatCurrency(MIN_AMOUNT)}`;
    }
    if (numericAmount > MAX_AMOUNT) {
      return `Valor máximo: ${formatCurrency(MAX_AMOUNT)}`;
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor da Recarga
        </label>
        <CurrencyInput value={amount} onChange={setAmount} />
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Recarga Mínima:</span>
          <span className="font-medium text-gray-900">{formatCurrency(MIN_AMOUNT)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Recarga Máxima:</span>
          <span className="font-medium text-gray-900">{formatCurrency(MAX_AMOUNT)}</span>
        </div>
      </div>

      {getAmountValidationMessage() && (
        <p className="text-sm text-red-600">{getAmountValidationMessage()}</p>
      )}

      <button
        type="submit"
        disabled={
          !amount || 
          parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.')) < MIN_AMOUNT ||
          parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.')) > MAX_AMOUNT
        }
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Recharge Now
      </button>
    </form>
  );
};