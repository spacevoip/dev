import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  value: string;
  label: string;
  Icon: LucideIcon;
}

const StatCard = ({ value, label, Icon }: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-secondary/30 transition-all duration-300 shadow-lg hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{value}</h3>
          <p className="text-lg text-secondary font-medium">{label}</p>
        </div>
        <div className="bg-secondary/10 p-3 rounded-xl">
          <Icon className="w-8 h-8 text-secondary" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;