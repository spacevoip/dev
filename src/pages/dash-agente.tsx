import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { Database } from '@/lib/database.types';
import { Phone, RefreshCw, PhoneOff, PhoneForwarded, MicOff } from 'lucide-react';

export default function DashAgente() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [status, setStatus] = useState<'available' | 'busy' | 'offline'>('offline');
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [agentStats, setAgentStats] = useState({
    totalCalls: 0,
    todayCalls: 0,
    averageCallTime: '0:00',
  });

  useEffect(() => {
    if (user) {
      // Subscribe to agent status changes
      const channel = supabase.channel(`agent-${user.id}`)
        .on('presence', { event: 'sync' }, () => {
          // Handle presence sync
        })
        .on('broadcast', { event: 'call' }, payload => {
          // Handle incoming calls
          setCurrentCall(payload);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, supabase]);

  const handleStatusChange = async (newStatus: 'available' | 'busy' | 'offline') => {
    setStatus(newStatus);
    // Update agent status in database
    if (user) {
      await supabase
        .from('agent_status')
        .upsert({ 
          agent_id: user.id, 
          status: newStatus,
          updated_at: new Date().toISOString()
        });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard do Agente</h1>
        <div className="flex gap-2">
          <Badge variant={status === 'available' ? 'success' : 'secondary'}
            className="cursor-pointer"
            onClick={() => handleStatusChange('available')}>
            Disponível
          </Badge>
          <Badge variant={status === 'busy' ? 'destructive' : 'secondary'}
            className="cursor-pointer"
            onClick={() => handleStatusChange('busy')}>
            Ocupado
          </Badge>
          <Badge variant={status === 'offline' ? 'outline' : 'secondary'}
            className="cursor-pointer"
            onClick={() => handleStatusChange('offline')}>
            Offline
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Total de Chamadas</h3>
          <p className="text-2xl">{agentStats.totalCalls}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Chamadas Hoje</h3>
          <p className="text-2xl">{agentStats.todayCalls}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Tempo Médio</h3>
          <p className="text-2xl">{agentStats.averageCallTime}</p>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Chamadas Ativas
          </h2>
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">CallerID</th>
                <th className="text-left p-2">Ramal</th>
                <th className="text-left p-2">Destino</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Duração</th>
                <th className="text-left p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentCall ? (
                <tr>
                  <td className="p-2">{currentCall.callerId}</td>
                  <td className="p-2">{currentCall.ramal}</td>
                  <td className="p-2">{currentCall.destino}</td>
                  <td className="p-2">
                    <Badge variant="success">{currentCall.status}</Badge>
                  </td>
                  <td className="p-2">{currentCall.duracao}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm">
                        <PhoneOff className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <PhoneForwarded className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MicOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Phone className="h-8 w-8" />
                      <p>Nenhuma chamada ativa no momento</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Atualização automática a cada 5 segundos
        </p>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Histórico de Chamadas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Data/Hora</th>
                <th className="text-left p-2">Número</th>
                <th className="text-left p-2">Duração</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {/* Histórico de chamadas será preenchido dinamicamente */}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
