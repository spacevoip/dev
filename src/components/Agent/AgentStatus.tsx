import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AgentStatusProps {
  status: 'available' | 'busy' | 'offline';
  onStatusChange: (status: 'available' | 'busy' | 'offline') => void;
}

export function AgentStatus({ status, onStatusChange }: AgentStatusProps) {
  return (
    <div className="flex gap-2">
      <Badge
        variant={status === 'available' ? 'success' : 'secondary'}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onStatusChange('available')}
      >
        Disponível
      </Badge>
      <Badge
        variant={status === 'busy' ? 'destructive' : 'secondary'}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onStatusChange('busy')}
      >
        Ocupado
      </Badge>
      <Badge
        variant={status === 'offline' ? 'outline' : 'secondary'}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onStatusChange('offline')}
      >
        Offline
      </Badge>
    </div>
  );
}
