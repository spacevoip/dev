import React from 'react';
import { Phone } from 'lucide-react';

interface ExtensionNumberProps {
  number: string;
}

export const ExtensionNumber: React.FC<ExtensionNumberProps> = ({ number }) => {
  return (
    <div className="flex items-center">
      <Phone className="h-5 w-5 text-gray-400 mr-2" />
      <span>{number}</span>
    </div>
  );
};