import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall,
  History, 
  HeadphonesIcon,
  Receipt, 
  Building2, 
  Settings,
  Menu,
  X,
  LogOut,
  Package
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    path: '/reseller/dashboard',
    description: 'Visão geral do seu negócio'
  },
  { 
    icon: Users, 
    label: 'Clientes', 
    path: '/reseller/customers',
    description: 'Gerenciar seus clientes'
  },
  { 
    icon: Package, 
    label: 'Planos', 
    path: '/reseller/plans',
    description: 'Gerenciar planos de assinatura'
  },
  { 
    icon: PhoneCall, 
    label: 'Ramais', 
    path: '/reseller/extensions',
    description: 'Gerenciar ramais'
  },
  { 
    icon: History, 
    label: 'Histórico', 
    path: '/reseller/call-history',
    description: 'Histórico de chamadas'
  },
  { 
    icon: HeadphonesIcon, 
    label: 'Suporte', 
    path: '/reseller/support',
    description: 'Central de ajuda'
  },
  { 
    icon: Receipt, 
    label: 'Faturamento', 
    path: '/reseller/billing',
    description: 'Faturas e pagamentos'
  },
  { 
    icon: Building2, 
    label: 'Empresa', 
    path: '/reseller/company',
    description: 'Dados da empresa'
  },
  { 
    icon: Settings, 
    label: 'Configurações', 
    path: '/reseller/settings',
    description: 'Configurações gerais'
  }
];

export const ResellerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 text-gray-700"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-40",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0" // Sempre visível em telas grandes
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b">
          <img src="/logoinovavoip.png" alt="Logo" className="h-8" />
        </div>

        {/* User Info */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all relative group",
                  isActive
                    ? "bg-violet-50 text-violet-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-violet-600"
                )}
              >
                <Icon size={20} className={isActive ? "text-violet-600" : ""} />
                <span>{item.label}</span>

                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-xs text-white rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {item.description}
                </div>
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={signOut}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all mt-4"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-200 bg-white",
          isSidebarOpen ? "lg:pl-64" : "lg:pl-0"
        )}
      >
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      {/* Overlay para fechar o sidebar em telas pequenas */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
