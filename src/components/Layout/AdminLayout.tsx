import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Menu } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg hover:opacity-90 transition-opacity"
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
        className={`fixed lg:static inset-y-0 left-0 z-40 transform 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out lg:translate-x-0
          w-64 xl:w-72 flex-shrink-0`}
      >
        <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden w-full relative">
        <div className="h-full overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-full">
            {/* Adiciona padding-top no mobile para não sobrepor o botão do menu */}
            <div className="pt-16 lg:pt-0 max-w-[1920px] mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};