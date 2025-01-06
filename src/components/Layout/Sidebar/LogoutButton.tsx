import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();

  const handleLogout = () => {
    navigate('/login');
  };

  if (isCollapsed) {
    return (
      <button
        onClick={handleLogout}
        className="p-3 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors group relative"
      >
        <LogOut className="h-5 w-5" />
        <div className="absolute left-full bottom-0 ml-2 px-2 py-1 bg-indigo-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          Logout
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
    >
      <LogOut className="h-5 w-5" />
      <span className="font-medium">Logout</span>
    </button>
  );
};