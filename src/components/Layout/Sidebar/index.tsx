import React from 'react';
import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { CollapseButton } from './CollapseButton';
import { AccountUser } from './AccountUser';
import { LogoutButton } from './LogoutButton';
import { useSidebar } from './SidebarContext';
import { X } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { isCollapsed } = useSidebar();

  return (
    <aside 
      className={`
        relative h-full bg-gradient-to-b from-indigo-950 via-indigo-900 to-violet-900 
        text-white flex flex-col shadow-xl transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16 sm:w-20 p-3 sm:p-4' : 'w-64 sm:w-72 p-4 sm:p-6'}
        max-h-screen overflow-hidden
      `}
    >
      {/* Header com Logo e Botão Fechar */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex-shrink-0">
          <Logo />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Close menu"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Informações do Usuário */}
        <div className="flex-shrink-0 mb-3 sm:mb-4">
          <AccountUser />
        </div>

        {/* Menu de Navegação com Scroll */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1 sm:pr-2">
          <Navigation />
        </div>
        
        {/* Rodapé Fixo */}
        <div className="flex-shrink-0 mt-3 sm:mt-4 space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </div>

      {/* Botão de Colapso (apenas desktop) */}
      <div className="hidden lg:block mt-3 sm:mt-4">
        <CollapseButton />
      </div>
    </aside>
  );
};

export default Sidebar;