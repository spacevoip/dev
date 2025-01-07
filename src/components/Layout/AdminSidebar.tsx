import React from 'react';
import { Navigation } from './Sidebar/Navigation';
import { LogoutButton } from './Sidebar/LogoutButton';
import { SidebarProvider } from './Sidebar/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { X } from 'lucide-react';

interface AdminSidebarProps {
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <aside className="h-full flex flex-col bg-gradient-to-b from-violet-600 to-fuchsia-600 text-white shadow-xl">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate">{user?.name}</span>
              <span className="text-xs text-white/70 truncate">ID: {user?.id}</span>
            </div>
          </div>
          {/* Close button - apenas visível em telas pequenas */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <Navigation />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>
    </SidebarProvider>
  );
};