import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { useSidebar } from './SidebarContext';

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  isActive: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  path,
  isActive,
}) => {
  const { isCollapsed } = useSidebar();

  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
        isActive
          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30'
          : 'text-indigo-100 hover:bg-white/10'
      }`}
    >
      <Icon className={`h-5 w-5 transition-transform duration-200 ${
        isActive ? 'text-white' : 'text-indigo-200 group-hover:text-white'
      }`} />
      {!isCollapsed && (
        <span className="font-medium tracking-wide">{label}</span>
      )}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-indigo-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </Link>
  );
};