import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatIconProps {
  icon: LucideIcon;
}

export const StatIcon: React.FC<StatIconProps> = ({ icon: Icon }) => {
  return (
    <div className="p-3 bg-blue-50 rounded-lg">
      <Icon className="h-6 w-6 text-blue-600" />
    </div>
  );
};