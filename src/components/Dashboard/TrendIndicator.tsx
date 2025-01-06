import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendProps {
  value: number;
  isPositive: boolean;
}

export const TrendIndicator: React.FC<TrendProps> = ({ value, isPositive }) => {
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  const bgClass = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${bgClass} ${colorClass}`}>
      <Icon className="h-3 w-3" />
      <span className="text-sm font-medium">{Math.abs(value)}%</span>
    </div>
  );
};