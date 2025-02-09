import React from 'react';
import { Navigation } from './Sidebar/Navigation';
import { LogoutButton } from './Sidebar/LogoutButton';
import { SidebarProvider } from './Sidebar/SidebarContext';
import { X } from 'lucide-react';

interface AdminSidebarProps {
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  return (
    <SidebarProvider>
      <aside className="h-full flex flex-col bg-gradient-to-b from-violet-600 to-fuchsia-600 text-white shadow-xl">
        {/* Header - Apenas com botão de fechar em telas pequenas */}
        {onClose && (
          <div className="p-4 flex justify-end lg:hidden border-b border-white/10">
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

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