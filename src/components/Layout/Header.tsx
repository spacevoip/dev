import React from 'react';
import { Menu, Settings, LogOut, Lock, ChevronDown, Home, PhoneCall } from 'lucide-react';
import { NotificationBell } from '../Notifications/NotificationBell';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { SearchMenu } from './SearchMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 active:scale-95 transform transition-all duration-150 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex items-center">
            <SearchMenu />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Home button */}
          <button 
            onClick={() => navigate('/dash')}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Início"
          >
            <Home className="h-5 w-5" />
          </button>

          {/* Active Calls button */}
          <button 
            onClick={() => navigate('/calls')}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Chamadas Ativas"
          >
            <PhoneCall className="h-5 w-5" />
          </button>

          {/* Settings button */}
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Configurações"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center text-white">
                <span className="text-sm font-medium">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser?.email}
                </p>
              </div>

              <div className="p-1">
                <DropdownMenuItem 
                  onClick={() => navigate('/settings')}
                  className="px-2 py-1.5 cursor-pointer focus:bg-gray-100"
                >
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/settings')}
                  className="px-2 py-1.5 cursor-pointer focus:bg-gray-100"
                >
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/settings?tab=security')}
                  className="px-2 py-1.5 cursor-pointer focus:bg-gray-100"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Alterar Senha
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="px-2 py-1.5 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
