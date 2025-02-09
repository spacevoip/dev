import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useAgent } from '../../contexts/AgentContext';
import {
  User,
  LogOut,
  Settings,
  PhoneCall,
  History,
  Bell,
  ChevronDown
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: any;
  onClick?: () => void;
}

interface AgentMenuProps {
  menuItems: MenuItem[];
}

export function AgentMenu({ menuItems }: AgentMenuProps) {
  const navigate = useNavigate();
  const { agent, setAgent } = useAgent();

  const handleLogout = () => {
    // Remove dados do agente
    localStorage.removeItem('agent');
    setAgent(null);
    
    // Usa navigate ao invés de window.location
    navigate('/login-agente', { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-2 text-left">
              <p className="text-sm font-medium">Ramal {agent?.numero}</p>
              <p className="text-xs text-gray-500">{agent?.nome || 'Agente'}</p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-sm font-medium text-gray-500">Menu do Agente</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {menuItems.map((item, index) => (
          <DropdownMenuItem 
            key={index} 
            className="flex items-center gap-3 cursor-pointer py-2 px-3 hover:bg-gray-50"
            onClick={item.onClick}
          >
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <item.icon className="h-4 w-4 text-gray-600" />
            </div>
            <span className="text-sm font-medium">{item.title}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center gap-3 cursor-pointer py-2 px-3 hover:bg-red-50 text-red-600"
          onClick={handleLogout}
        >
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <LogOut className="h-4 w-4 text-red-600" />
          </div>
          <span className="text-sm font-medium">Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
