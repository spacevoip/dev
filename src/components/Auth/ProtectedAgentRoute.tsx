import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAgent } from '../../contexts/AgentContext';

interface ProtectedAgentRouteProps {
  children: React.ReactNode;
}

export function ProtectedAgentRoute({ children }: ProtectedAgentRouteProps) {
  const { agent } = useAgent();
  const location = useLocation();

  if (!agent) {
    // Redireciona para o login do agente se não estiver autenticado
    return <Navigate to="/login-agente" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
