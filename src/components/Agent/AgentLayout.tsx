import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAgent } from '../../contexts/AgentContext';
import { User, LayoutDashboard, PhoneCall, History, Bell, Settings, Phone } from 'lucide-react';
import { AgentMenu } from './AgentMenu';

export function AgentLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { agent } = useAgent();
  const [isScrolled, setIsScrolled] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dash-agente':
        return 'Painel do Agente';
      case '/historico-agente':
        return 'Histórico de Chamadas';
      case '/perfil-agente':
        return 'Perfil do Agente';
      default:
        return 'Painel do Agente';
    }
  };

  useEffect(() => {
    document.title = `InovaVoip - ${getPageTitle()}`;
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    {
      title: 'Início',
      icon: LayoutDashboard,
      onClick: () => navigate('/dash-agente')
    },
    {
      title: 'Histórico',
      icon: History,
      onClick: () => navigate('/historico-agente')
    },
    {
      title: 'Perfil',
      icon: User,
      onClick: () => navigate('/perfil-agente')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50 transition-all duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-purple-600 shrink-0">
                InovaVoip - <span className="text-gray-700">{getPageTitle()}</span>
              </span>
              <div className={`flex items-center gap-4 transition-all duration-300 ease-in-out ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 invisible'}`}>
                <div className="h-5 w-[1px] bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium whitespace-nowrap">Agente ({agent?.numero})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium whitespace-nowrap">CallerID: {agent?.callerid}</span>
                </div>
              </div>
            </div>
            <AgentMenu menuItems={menuItems} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
