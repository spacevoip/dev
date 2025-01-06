import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import type { ActiveCall, CallsResponse } from '../types/activeCalls';
import { supabase } from '../lib/supabase';

// Usando a variável de ambiente do Vite
const API_URL = import.meta.env.VITE_API_URL?.replace(/^http:/, 'https:').replace(/\/$/, '');

// Função auxiliar para extrair o ramal do Channel
function extractRamal(channel: string): string {
  const match = channel.match(/PJSIP\/(\d{4})/);
  return match ? match[1] : '';
}

// Função auxiliar para traduzir o estado
function translateState(state: string): string {
  switch (state) {
    case 'Ring':
      return 'Chamando';
    case 'Up':
      return 'Falando';
    default:
      return state;
  }
}

export function useActiveCalls() {
  const { user } = useAuth();
  const accountId = user?.accountid;

  const fetchCalls = async () => {
    if (!accountId) {
      console.log('Nenhum accountId disponível');
      return [];
    }

    if (!API_URL) {
      console.error('VITE_API_URL não está configurada');
      return [];
    }

    try {
      console.log('Tentando buscar chamadas de:', `${API_URL}/active-calls`);
      
      // Busca as chamadas da API com timeout de 5 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_URL}/active-calls`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText
        });
        return [];
      }
      
      const data = await response.json() as CallsResponse;
      console.log('Dados recebidos da API:', data);

      if (!data || !data.active_calls) {
        console.error('Dados inválidos da API:', data);
        return [];
      }

      // Filtra e processa as chamadas
      const processedCalls = data.active_calls
        .filter(call => {
          const isValid = call.Accountcode === accountId && ['Ring', 'Up'].includes(call.State);
          if (!isValid) {
            console.log('Chamada filtrada:', { call, accountId });
          }
          return isValid;
        })
        .map(call => ({
          id: crypto.randomUUID(),
          callerid: call.CallerID,
          duracao: call.Duration,
          destino: call.Extension,
          status: translateState(call.State),
          ramal: extractRamal(call.Channel),
          channel: call.Channel,
        }));

      console.log('Chamadas processadas:', processedCalls);

      // Salva as chamadas no banco
      if (processedCalls.length > 0) {
        const { error } = await supabase
          .from('active_calls')
          .upsert(processedCalls, {
            onConflict: 'id',
          });

        if (error) {
          console.error('Erro ao salvar chamadas:', error);
        }
      }

      return processedCalls;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('Timeout ao buscar chamadas');
      } else {
        console.error('Erro ao buscar chamadas:', error);
      }
      return [];
    }
  };

  return useQuery({
    queryKey: ['active-calls', accountId],
    queryFn: fetchCalls,
    refetchInterval: 5000,
    enabled: !!accountId && !!API_URL,
    retry: 1,
    retryDelay: 1000,
    staleTime: 2000,
    cacheTime: 0,
    refetchOnWindowFocus: false,
  });
}
