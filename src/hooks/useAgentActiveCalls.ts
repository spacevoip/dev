import { useState, useEffect, useRef } from 'react';
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

export const useAgentActiveCalls = (pollingInterval = 5000) => {
  const { agent } = useAgent();
  const [calls, setCalls] = useState<AgentActiveCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPollingPaused, setIsPollingPaused] = useState(false);
  
  // Refs para controle de polling e cleanup
  const pollingTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchCalls = async () => {
    if (!agent || isPollingPaused) {
      setLoading(false);
      return;
    }

    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cria novo controller para esta requisição
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      console.log('Buscando chamadas para o agente:', agent);
      const allCalls = await fetchActiveCalls(abortControllerRef.current.signal);
      
      console.log('Todas as chamadas recebidas:', allCalls);
      
      // Filtra as chamadas pelo accountid do agente e pelo ramal
      const agentCalls = allCalls.filter(call => {
        if (!call) return false;
        
        const isAccountMatch = call.Accountcode === agent?.accountid;
        const channelRamal = call.Channel?.split('/')[1]?.split('-')[0];
        const isRamalMatch = channelRamal === agent?.numero;
        
        console.log('Verificando chamada:', {
          call,
          isAccountMatch,
          channelRamal,
          agentNumero: agent?.numero,
          isRamalMatch
        });
        
        return isAccountMatch && isRamalMatch;
      });

      console.log('Chamadas filtradas para o agente:', agentCalls);

      setCalls(agentCalls);
      setError(null);
      retryCountRef.current = 0;
      
      // Se estava pausado e deu sucesso, retoma o polling
      if (isPollingPaused) {
        setIsPollingPaused(false);
      }
    } catch (err: any) {
      // Ignora erros de cancelamento (acontecem durante cleanup)
      if (err.message === 'CANCELED') {
        return;
      }

      console.error('Erro ao buscar chamadas:', err);
      setError(err.message);
      
      // Só faz retry em erros de conexão/timeout
      const isNetworkError = err.message.includes('conectar') || 
                           err.message.includes('timeout') ||
                           err.message.includes('network');
      
      if (isNetworkError) {
        if (retryCountRef.current < maxRetries) {
          const backoffTime = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          retryCountRef.current++;
          setTimeout(fetchCalls, backoffTime);
        } else {
          setIsPollingPaused(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para retomar polling
  const resumePolling = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }
    setIsPollingPaused(false);
    retryCountRef.current = 0;
    fetchCalls();
  };

  useEffect(() => {
    let mounted = true;

    const setupPolling = () => {
      if (!mounted || isPollingPaused) return;
      
      fetchCalls().then(() => {
        if (mounted && !isPollingPaused) {
          pollingTimeoutRef.current = setTimeout(setupPolling, pollingInterval);
        }
      });
    };

    if (agent) {
      setupPolling();
    }

    // Cleanup
    return () => {
      mounted = false;
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [agent, isPollingPaused, pollingInterval]);

  return { 
    calls, 
    loading, 
    error, 
    refetch: fetchCalls,
    isPollingPaused,
    resumePolling
  };
};
