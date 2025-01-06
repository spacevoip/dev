import React from 'react';
import { Phone } from 'lucide-react';
import type { ActiveCall } from '../../types';

interface CallStatusIconProps {
  status: ActiveCall['status'];
}

export const CallStatusIcon: React.FC<CallStatusIconProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600'
        };
      case 'holding':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`p-2 rounded-full ${styles.bg}`}>
      <Phone className={`h-5 w-5 ${styles.text}`} />
    </div>
  );
};