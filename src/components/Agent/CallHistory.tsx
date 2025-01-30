import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Call {
  id: string;
  timestamp: string;
  number: string;
  duration: string;
  status: 'completed' | 'missed' | 'transferred';
}

interface CallHistoryProps {
  calls: Call[];
}

export function CallHistory({ calls }: CallHistoryProps) {
  const getStatusBadge = (status: Call['status']) => {
    const variants = {
      completed: 'success',
      missed: 'destructive',
      transferred: 'secondary'
    };
    
    const labels = {
      completed: 'Completada',
      missed: 'Perdida',
      transferred: 'Transferida'
    };

    return (
      <Badge variant={variants[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Histórico de Chamadas</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 text-muted-foreground">Data/Hora</th>
              <th className="text-left p-2 text-muted-foreground">Número</th>
              <th className="text-left p-2 text-muted-foreground">Duração</th>
              <th className="text-left p-2 text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-b hover:bg-muted/50">
                <td className="p-2">{new Date(call.timestamp).toLocaleString()}</td>
                <td className="p-2">{call.number}</td>
                <td className="p-2">{call.duration}</td>
                <td className="p-2">{getStatusBadge(call.status)}</td>
              </tr>
            ))}
            {calls.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-muted-foreground">
                  Nenhuma chamada registrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
