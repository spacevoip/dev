import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export const CollapseButton: React.FC = () => {
  const { isCollapsed, toggleCollapse } = useSidebar();

  return (
    <button
      onClick={toggleCollapse}
      className="absolute -right-3 top-12 p-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg hover:shadow-violet-500/30 transition-all duration-300"
    >
      {isCollapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </button>
  );
};