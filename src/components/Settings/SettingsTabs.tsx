import React from 'react';
import { Settings, Shield, CreditCard, Bell, Link } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface SettingsTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function SettingsTabs({ currentTab, onTabChange }: SettingsTabsProps) {
  const tabs: Tab[] = [
    { 
      id: 'profile',
      name: 'Perfil', 
      icon: <Settings className="h-4 w-4" />
    },
    { 
      id: 'security',
      name: 'Segurança', 
      icon: <Shield className="h-4 w-4" />
    },
    { 
      id: 'plan',
      name: 'Plano', 
      icon: <CreditCard className="h-4 w-4" />
    },
    { 
      id: 'notifications',
      name: 'Notificações', 
      icon: <Bell className="h-4 w-4" />
    },
    { 
      id: 'integrations',
      name: 'Integrações', 
      icon: <Link className="h-4 w-4" />
    },
  ];

  return (
    <div className="border-b border-gray-100">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'group inline-flex items-center py-4 px-1 border-b-2 text-sm font-medium',
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <div className={cn(
                'flex items-center space-x-2',
                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
              )}>
                {React.cloneElement(tab.icon as React.ReactElement, {
                  className: cn(
                    'h-4 w-4',
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  )
                })}
                <span>{tab.name}</span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
