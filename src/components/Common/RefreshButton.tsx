import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => void;
  size?: 'sm' | 'md';
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  onRefresh,
  size = 'md'
}) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = () => {
    setIsRotating(true);
    onRefresh();
    setTimeout(() => setIsRotating(false), 1000);
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  };

  return (
    <button
      onClick={handleRefresh}
      className={`${sizeClasses[size]} rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200`}
      title="Refresh"
    >
      <RotateCw 
        className={`${iconSizes[size]} ${isRotating ? 'animate-spin' : ''}`}
      />
    </button>
  );
};