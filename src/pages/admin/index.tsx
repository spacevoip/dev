import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../hooks/useUserData';
import { Users, Phone, History, Settings } from 'lucide-react';

export function AdminPanel() {
  const navigate = useNavigate();
  const { userData } = useUserData();

  // Redireciona para o dashboard se não for admin
  React.useEffect(() => {
    if (userData && userData.role !== 'admin') {
      navigate('/dash');
    }
  }, [userData, navigate]);

  const adminModules = [
    {
      title: 'Users Management',
      icon: Users,
      description: 'Manage users, roles, and permissions',
      path: '/admin/users',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Extensions Management',
      icon: Phone,
      description: 'Manage and monitor all extensions',
      path: '/admin/extensions',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Call Records',
      icon: History,
      description: 'View and analyze call records',
      path: '/admin/calls',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'System Settings',
      icon: Settings,
      description: 'Configure system settings and parameters',
      path: '/admin/settings',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  if (!userData || userData.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-500">Manage your system settings and users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminModules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.path}
              onClick={() => navigate(module.path)}
              className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-left group"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${module.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
              <p className="text-gray-500 text-sm">{module.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
