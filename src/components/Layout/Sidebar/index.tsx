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
    <div 
      className={`relative h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-violet-900 text-white p-6 flex flex-col shadow-xl transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex items-center justify-between mb-16">
        <Logo />
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <AccountUser />
      <Navigation />
      
      <div className="mt-auto space-y-4">
        <CreditBalance />
        <LogoutButton />
      </div>

      <CollapseButton />
    </div>
  );
};

export default Sidebar;