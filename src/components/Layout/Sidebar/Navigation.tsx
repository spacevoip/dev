import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { 
  LayoutDashboard,
  Users,
  PhoneCall,
  History,
  PhoneIncoming,
  CreditCard,
  Settings,
  Ticket,
  ListOrdered,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Painel', path: '/dash' },
  { icon: Users, label: 'Ramais', path: '/extensions' },
  { icon: ListOrdered, label: 'Filas', path: '/queues' },
  { icon: PhoneCall, label: 'Chamadas Ativas', path: '/calls' },
  { icon: History, label: 'Histórico', path: '/history' },
  { icon: PhoneIncoming, label: 'DID', path: '/did' },
  { icon: CreditCard, label: 'Recarregar Créditos', path: '/recharge' },
  { icon: Ticket, label: 'Assinaturas & Planos', path: '/plans' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { isCollapsed } = useSidebar();
  
  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-white/20 text-white font-medium' 
                : 'text-white/70 hover:bg-white/10 hover:text-white'
              }
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? item.label : undefined}
          >
            <Icon className={`flex-shrink-0 ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`} />
            {!isCollapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};