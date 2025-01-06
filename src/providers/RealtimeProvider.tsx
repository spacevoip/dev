import React from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { currentUser } = useCurrentUser();
  
  // Configura as inscrições em tempo real globalmente
  useRealtimeSubscription(currentUser?.accountid);

  return <>{children}</>;
};
