import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { SidebarProvider } from './Sidebar/SidebarContext';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-40 transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } transition-transform duration-300 ease-in-out lg:translate-x-0 h-full`}
        >
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto w-full">
          <main className="min-h-screen">
            <div className="container mx-auto px-4 py-6 lg:px-8">
              {/* Adiciona padding-top no mobile para não sobrepor o botão do menu */}
              <div className="pt-16 lg:pt-0">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};