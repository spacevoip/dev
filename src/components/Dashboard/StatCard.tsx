import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  className = '',
  iconClassName = '',
}) => {
  return (
    <div className={`p-6 rounded-xl transition-transform hover:scale-[1.02] ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className={`p-3 rounded-lg ${iconClassName}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};