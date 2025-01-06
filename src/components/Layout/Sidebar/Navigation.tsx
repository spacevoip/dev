import React from 'react';
import { useLocation } from 'react-router-dom';
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
import { MenuItem } from './MenuItem';
import { useSidebar } from './SidebarContext';

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
    <nav className={`space-y-2.5 ${isCollapsed ? 'px-2' : ''}`}>
      {menuItems.map((item) => (
        <MenuItem
          key={item.path}
          {...item}
          isActive={location.pathname === item.path}
        />
      ))}
    </nav>
  );
};