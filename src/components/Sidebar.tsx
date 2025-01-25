import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall,
  History,
  Phone,
  CreditCard,
  Package,
  Settings,
  LogOut,
  Shield,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { useUserData } from '../hooks/useUserData';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';

export function Sidebar() {
  const location = useLocation();
  const { userData, loading } = useUserData();
  const { signOut } = useAuth();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dash' },
    { icon: Users, label: 'Extensions', path: '/extensions' },
    { icon: PhoneCall, label: 'Active Calls', path: '/active-calls' },
    { icon: History, label: 'Call History', path: '/call-history' },
    { icon: Phone, label: 'DID', path: '/did' },
    { icon: CreditCard, label: 'Recharge Credits', path: '/recharge' },
    { icon: Package, label: 'Assinaturas & Planos', path: '/plans' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: RefreshCw, label: 'SIP Auto', path: '/sip-auto' },
  ];

  // Adiciona o botão de admin no menu se o usuário for admin
  if (userData?.role === 'admin') {
    menuItems.push(
      { icon: Users, label: 'Usuários', path: '/admin/users' },
      { icon: DollarSign, label: 'Financeiro', path: '/admin/finance' },
      { icon: Settings, label: 'Configurações', path: '/admin/settings' },
      { icon: Shield, label: 'Admin Panel', path: '/admin' }
    );
  }

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-indigo-950 to-violet-900 text-white p-4 flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <img src="/logo.svg" alt="Logo" className="h-8" />
        <div>
          <h1 className="text-xl font-bold">SpaceVoip</h1>
          <p className="text-sm text-gray-300">Management System</p>
        </div>
      </div>

      {/* User Card */}
      {!loading && userData && (
        <div className="mb-8 p-4 rounded-lg bg-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <span className="text-lg font-semibold">
                {userData.name?.charAt(0).toUpperCase() || 'S'}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{userData.name || 'Space Brasil'}</h3>
              <p className="text-sm text-gray-300">{userData.email || 'space@space.com'}</p>
              <p className="text-xs text-gray-400">
                {userData.role === 'admin' ? 'Administrator' : 'User'}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/admin' 
            ? location.pathname.startsWith('/admin')
            : location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={\`flex items-center gap-3 p-3 rounded-lg transition-colors \${
                isActive
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30'
                  : 'hover:bg-white/10'
              }\`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Saldo Card */}
      <div className="mt-auto mb-4">
        <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm">Saldo Disponível</span>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="p-1 hover:bg-white/10 rounded-full"
              title="Atualizar saldo"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(userData?.balance || 0)}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={signOut}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors w-full"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </div>
  );
}