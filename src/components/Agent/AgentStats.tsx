import React from 'react';
import { Card } from '@/components/ui/card';

interface AgentStatsProps {
  totalCalls: number;
  todayCalls: number;
  averageCallTime: string;
}

export function AgentStats({ totalCalls, todayCalls, averageCallTime }: AgentStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Total de Chamadas</h3>
        <p className="text-2xl font-bold">{totalCalls}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Chamadas Hoje</h3>
        <p className="text-2xl font-bold">{todayCalls}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Tempo Médio</h3>
        <p className="text-2xl font-bold">{averageCallTime}</p>
      </Card>
    </div>
  );
}
