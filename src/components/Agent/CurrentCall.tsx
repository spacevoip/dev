import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CurrentCallProps {
  call: {
    number: string;
    duration: string;
    status: string;
  };
  onEndCall: () => void;
  onTransfer: () => void;
  onMute: () => void;
}

export function CurrentCall({ call, onEndCall, onTransfer, onMute }: CurrentCallProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chamada Atual</h2>
        <Badge variant="secondary">{call.status}</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Número</p>
          <p className="text-lg font-medium">{call.number}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Duração</p>
          <p className="text-lg font-medium">{call.duration}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="destructive" onClick={onEndCall}>
          Encerrar
        </Button>
        <Button variant="secondary" onClick={onTransfer}>
          Transferir
        </Button>
        <Button variant="outline" onClick={onMute}>
          Mudo
        </Button>
      </div>
    </Card>
  );
}
