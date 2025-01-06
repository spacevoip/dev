import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  Users, 
  Settings,
  LogOut 
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Painel', path: '/admin' },
  { icon: Server, label: 'Instâncias', path: '/admin/instances' },
  { icon: Users, label: 'Usuários', path: '/admin/users' },
  { icon: Settings, label: 'Configurações', path: '/admin/settings' },
];

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="w-64 bg-gray-900 text-white p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <Server className="h-8 w-8 text-blue-400" />
        <div>
          <h1 className="text-xl font-bold">PABX Admin</h1>
          <p className="text-xs text-gray-400">Painel de Gerenciamento</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 mt-6 border-t border-gray-800">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair do Admin</span>
        </Link>
      </div>
    </div>
  );
};