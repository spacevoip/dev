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
  RefreshCw,
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
  { icon: RefreshCw, label: 'SIP Auto Diall', path: '/sip-auto' },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { isCollapsed } = useSidebar();
  
  return (
    <nav className="space-y-1 w-full">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 w-full
              ${isActive 
                ? 'bg-white/20 text-white font-medium' 
                : 'text-white/70 hover:bg-white/10 hover:text-white'
              }
              ${isCollapsed ? 'justify-center' : 'justify-start'}
              sm:px-3 sm:py-2.5 sm:gap-3
            `}
            title={isCollapsed ? item.label : undefined}
          >
            <Icon className={`flex-shrink-0 ${isCollapsed ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
            {!isCollapsed && (
              <span className="truncate text-sm sm:text-base">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};