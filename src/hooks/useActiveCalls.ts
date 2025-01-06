import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import type { CallsResponse } from '../types/activeCalls';

// Usando a variável de ambiente do Vite e forçando HTTPS
const API_URL = (import.meta.env.VITE_API_URL || 'https://91.108.125.149:5000')
  .replace(/^http:/, 'https:')
  .replace(/\/$/, '');

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

// Função para garantir HTTPS na URL
const ensureHttps = (url: string) => url.replace(/^http:/, 'https:');

export function useActiveCalls() {
  const { user } = useAuth();
  const accountId = user?.accountid;

  const fetchCalls = async () => {
    if (!accountId || !API_URL) {
      return [];
    }

    try {
      const apiUrl = ensureHttps(`${API_URL}/active-calls`);
      
      // Busca as chamadas da API com timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        return [];
      }
      
      const data = await response.json() as CallsResponse;

      if (!data?.active_calls) {
        return [];
      }

      // Filtra e processa as chamadas
      return data.active_calls
        .filter(call => {
          // Filtra apenas chamadas com estado Ring ou Up
          const validState = ['Ring', 'Up'].includes(call.State);
          
          // Verifica se o ramal pertence ao usuário
          const ramal = extractRamal(call.Channel);
          const isUserCall = ramal && call.Accountcode === accountId;
          
          return validState && isUserCall;
        })
        .map(call => ({
          channel: call.Channel,
          callerid: call.CallerID,
          duracao: call.Duration,
          destino: call.Extension,
          status: translateState(call.State),
          ramal: extractRamal(call.Channel)
        }));

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('Timeout ao buscar chamadas');
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
