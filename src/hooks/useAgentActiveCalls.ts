import { useState, useEffect } from 'react';
import { fetchActiveCalls } from '../services/activeCalls';
import { useAgent } from '../contexts/AgentContext';

export interface AgentActiveCall {
  Accountcode: string;
  CallerID: string;
  Channel: string;
  Duration: string;
  Extension: string;
  State: string;
}

export const useAgentActiveCalls = () => {
  const { agent } = useAgent();
  const [calls, setCalls] = useState<AgentActiveCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const allCalls = await fetchActiveCalls();
      
      // Filtra as chamadas pelo accountid do agente e pelo ramal
      const agentCalls = allCalls.filter(call => {
        const isAccountMatch = call.Accountcode === agent?.accountid;
        const channelRamal = call.Channel.split('/')[1]?.split('-')[0];
        const isRamalMatch = channelRamal === agent?.numero;
        
        return isAccountMatch && isRamalMatch;
      });

      setCalls(agentCalls);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar chamadas ativas:', err);
      setError('Erro ao buscar chamadas ativas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agent) {
      fetchCalls();
      // Atualiza a cada 5 segundos
      const interval = setInterval(fetchCalls, 5000);
      return () => clearInterval(interval);
    }
  }, [agent]);

  return { calls, loading, error, refetch: fetchCalls };
};
