import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgentUser } from '../lib/agentAuth';

interface AgentContextType {
  agent: AgentUser | null;
  setAgent: (agent: AgentUser | null) => void;
  logout: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<AgentUser | null>(() => {
    // Inicializa o estado com os dados do localStorage
    const storedAgent = localStorage.getItem('agent');
    if (storedAgent) {
      try {
        return JSON.parse(storedAgent);
      } catch (error) {
        console.error('Erro ao recuperar dados do agente:', error);
        localStorage.removeItem('agent');
        return null;
      }
    }
    return null;
  });

  // Atualiza o localStorage quando o agente mudar
  useEffect(() => {
    if (agent) {
      localStorage.setItem('agent', JSON.stringify(agent));
    } else {
      localStorage.removeItem('agent');
    }
  }, [agent]);

  const logout = () => {
    setAgent(null);
    localStorage.removeItem('agent');
    window.location.href = '/login-agente';
  };

  return (
    <AgentContext.Provider value={{ agent, setAgent, logout }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent deve ser usado dentro de um AgentProvider');
  }
  return context;
}
