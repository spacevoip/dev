import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  Icon: LucideIcon;
  title: string;
  className?: string;
}

const FeatureCard = ({ Icon, title, className = '' }: FeatureCardProps) => {
  return (
    <div className={`bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-lg flex items-center space-x-3 border border-white/20 ${className}`}>
      <Icon className="h-6 w-6 text-primary" />
      <span className="text-gray-800 font-medium">{title}</span>
    </div>
  );
};

export default FeatureCard;