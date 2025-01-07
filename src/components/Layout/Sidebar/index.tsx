import React from 'react';
import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { CreditBalance } from './CreditBalance';
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
      className={`relative h-full bg-gradient-to-b from-indigo-950 via-indigo-900 to-violet-900 text-white flex flex-col shadow-xl transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20 p-4' : 'w-72 p-6'
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <Logo />
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <AccountUser />
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <Navigation />
        </div>
        
        <div className="mt-auto space-y-4 pt-4">
          <CreditBalance />
          <LogoutButton />
        </div>
      </div>

      <div className="hidden lg:block">
        <CollapseButton />
      </div>
    </aside>
  );
};

export default Sidebar;