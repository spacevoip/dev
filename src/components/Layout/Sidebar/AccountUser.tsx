import React from 'react';
import { User } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { useUserData } from '../../../hooks/useUserData';

export const AccountUser: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const { userData, loading } = useUserData();

  if (loading || !userData) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl mb-6 group relative">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center">
            <span className="text-white font-medium">
              {userData.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        </div>
        <div className="absolute left-full ml-2 px-3 py-2 bg-indigo-900 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          <p className="font-medium text-white">{userData.name}</p>
          <p className="text-xs text-indigo-200">{userData.email}</p>
          <p className="text-xs text-indigo-300 mt-1">ID: {userData.accountid}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-medium">
            {userData.name?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-white truncate">{userData.name}</p>
          <p className="text-xs text-indigo-200 truncate">{userData.email}</p>
          <p className="text-xs text-indigo-300 mt-1">ID: {userData.accountid}</p>
        </div>
      </div>
    </div>
  );
};