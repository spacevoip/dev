import React from 'react';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Remove all non-numeric characters
    input = input.replace(/\D/g, '');
    
    // Convert to number and format as currency
    if (input) {
      // Convert to decimal by dividing by 100
      const numericValue = parseFloat(input) / 100;
      
      if (!isNaN(numericValue)) {
        input = numericValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    } else {
      input = '';
    }
    
    onChange(input);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="block w-full pl-3 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
        placeholder="R$ 0,00"
      />
    </div>
  );
};