import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

interface MenuItem {
  label: string;
  path: string;
  description: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { 
    label: 'Painel',
    path: '/dash',
    description: 'Visualize estatísticas e informações gerais',
    icon: 'LayoutDashboard'
  },
  { 
    label: 'Ramais',
    path: '/extensions',
    description: 'Gerencie seus ramais SIP',
    icon: 'Users'
  },
  { 
    label: 'Filas',
    path: '/queues',
    description: 'Gerencie filas de atendimento',
    icon: 'ListOrdered'
  },
  { 
    label: 'Chamadas Ativas',
    path: '/calls',
    description: 'Visualize e gerencie chamadas em andamento',
    icon: 'PhoneCall'
  },
  { 
    label: 'Histórico',
    path: '/history',
    description: 'Histórico completo de chamadas',
    icon: 'History'
  },
  { 
    label: 'DID',
    path: '/did',
    description: 'Gerencie seus números DID',
    icon: 'PhoneIncoming'
  },
  { 
    label: 'Recarregar Créditos',
    path: '/recharge',
    description: 'Adicione créditos à sua conta',
    icon: 'CreditCard'
  },
  { 
    label: 'Assinaturas & Planos',
    path: '/plans',
    description: 'Gerencie suas assinaturas e planos',
    icon: 'Ticket'
  },
  { 
    label: 'Configurações',
    path: '/settings',
    description: 'Ajuste as configurações do sistema',
    icon: 'Settings'
  },
  { 
    label: 'SIP Auto Diall',
    path: '/sip-auto',
    description: 'Configure discagem automática',
    icon: 'RefreshCw'
  }
];

export const useMenuSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filtra os itens baseado no termo de busca
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    return menuItems.filter(item => 
      item.label.toLowerCase().includes(normalizedSearch) ||
      item.description.toLowerCase().includes(normalizedSearch)
    );
  }, [searchTerm]);

  // Navega para a rota selecionada
  const handleSelectItem = (path: string) => {
    setSearchTerm('');
    setIsSearching(false);
    navigate(path);
  };

  return {
    searchTerm,
    setSearchTerm,
    isSearching,
    setIsSearching,
    filteredItems,
    handleSelectItem
  };
};
