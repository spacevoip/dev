import React from 'react';
import { Clock } from 'lucide-react';

export const ComingSoonBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
      <Clock className="h-3.5 w-3.5" />
      <span className="text-sm font-medium">Em Breve</span>
    </div>
  );
};