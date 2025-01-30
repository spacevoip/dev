import { Navigate } from 'react-router-dom';
import { useAgent } from '@/contexts/AgentContext';

interface PrivateRouteAgentProps {
  children: React.ReactNode;
}

export function PrivateRouteAgent({ children }: PrivateRouteAgentProps) {
  const { agent } = useAgent();
  
  // Se não houver agente logado, redireciona para a página de login
  if (!agent) {
    // Verifica se há dados do agente no localStorage
    const storedAgent = localStorage.getItem('agent');
    if (!storedAgent) {
      return <Navigate to="/login-agente" replace />;
    }
  }

  // Se houver agente ou dados no localStorage, renderiza o conteúdo
  return <>{children}</>;
}
