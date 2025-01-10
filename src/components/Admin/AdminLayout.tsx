import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useUserData } from '../../hooks/useUserData';
import { Users, LayoutDashboard, Settings, LogOut, Phone, PhoneCall, Ban, PhoneOutgoing } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLayout() {
  const { userData, loading } = useUserData();
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Usuários', path: '/admin/users' },
    { icon: Phone, label: 'Extensions', path: '/admin/extensions' },
    { icon: PhoneCall, label: 'Call History', path: '/admin/call-history' },
    { icon: PhoneOutgoing, label: 'Chamadas Ativas', path: '/admin/active-calls' },
    { icon: Ban, label: 'CallerID Block', path: '/admin/calleridblock' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (userData?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 flex flex-col">
        <div className="flex justify-center mb-8">
          <img 
            src="/logoinovavoip.png" 
            alt="InovaVoip Logo" 
            className="h-28 w-auto"
          />
        </div>

        {/* User Card */}
        {!loading && userData && (
          <div className="mb-8 p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white">
                <span className="text-lg font-semibold">
                  {userData.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{userData.name}</h3>
                <p className="text-sm text-gray-500">{userData.email}</p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Voltar ao Sistema</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
