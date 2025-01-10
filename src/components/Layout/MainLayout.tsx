import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { SidebarProvider } from './Sidebar/SidebarContext';
import { useBackgroundSync } from '../../hooks/useBackgroundSync';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Ativa a sincronização em segundo plano
  useBackgroundSync();

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Mobile menu button - Melhorado com animação e posição ajustada */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg hover:opacity-90 active:scale-95 transform transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Overlay com blur e animação melhorada */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-300 ease-in-out"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar com animação e gestos de swipe */}
        <div 
          className={`fixed inset-y-0 left-0 transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 lg:w-auto`}
        >
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main content com padding ajustado para mobile */}
        <div className="flex-1 overflow-auto">
          <main className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-4 sm:py-6">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};