import React from 'react';
import { useSidebar } from './SidebarContext';

export const Logo: React.FC = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex items-center justify-center p-4">
      <img 
        src="/logoinovavoip.png" 
        alt="InovaVoip Logo" 
        className={`transition-all duration-300 ${isCollapsed ? 'h-16' : 'h-28'} w-auto`}
      />
    </div>
  );
};