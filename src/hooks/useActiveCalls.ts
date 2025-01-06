import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import type { ActiveCall, CallsResponse } from '../types/activeCalls';
import { supabase } from '../lib/supabase';

// Usando a variável de ambiente do Vite
const API_URL = import.meta.env.VITE_API_URL;

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
      return [];
    }

    try {
      // Busca as chamadas da API
      const response = await fetch(`${API_URL}/active-calls`);
      if (!response.ok) {
        console.error('Erro na resposta da API:', response.statusText);
        throw new Error('Erro ao buscar chamadas');
      }
      
      const data = await response.json() as CallsResponse;
      if (!data || !data.active_calls) {
        console.error('Dados inválidos da API:', data);
        throw new Error('Dados inválidos da API');
      }

      // Filtra e processa as chamadas
      const processedCalls = data.active_calls
        .filter(call => {
          // Filtra apenas chamadas:
          // 1. Do accountid do usuário
          // 2. Com State Ring ou Up
          return call.Accountcode === accountId && ['Ring', 'Up'].includes(call.State);
        })
        .map(call => {
          console.log('Channel da API:', call.Channel); // Debug
          return {
            id: crypto.randomUUID(),
            callerid: call.CallerID,
            duracao: call.Duration,
            destino: call.Extension,
            status: translateState(call.State),
            ramal: extractRamal(call.Channel),
            channel: call.Channel,
          };
        });

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
      console.error('Erro ao buscar chamadas:', error);
      // Retorna array vazio em caso de erro para não quebrar a UI
      return [];
    }
  };

  return useQuery({
    queryKey: ['active-calls', accountId],
    queryFn: fetchCalls,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
    enabled: !!accountId,
    retry: 3, // Tenta 3 vezes antes de falhar
    retryDelay: 1000, // Espera 1 segundo entre as tentativas
    staleTime: 2000, // Considera os dados frescos por 2 segundos
    cacheTime: 0, // Não mantém cache entre refetches
  });
}
