import { Navigate } from 'react-router-dom';
import { useAgent } from '@/contexts/AgentContext';

interface AgentRedirectRouteProps {
  children: React.ReactNode;
}

export function AgentRedirectRoute({ children }: AgentRedirectRouteProps) {
  const { agent } = useAgent();

  // Se for um agente, redireciona para o painel do agente
  if (agent) {
    return <Navigate to="/dash-agente" replace />;
  }

  // Se não for um agente, permite o acesso à rota original
  return <>{children}</>;
}
