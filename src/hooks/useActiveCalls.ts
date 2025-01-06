import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import type { ActiveCall, CallsResponse } from '../types/activeCalls';
import { supabase } from '../lib/supabase';

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
  const userId = user?.id;

  const fetchCalls = async () => {
    if (!userId) {
      console.log('Nenhum userId disponível');
      return [];
    }

    if (!API_URL) {
      console.error('VITE_API_URL não está configurada');
      return [];
    }

    try {
      const apiUrl = ensureHttps(`${API_URL}/active-calls`);
      console.log('Tentando buscar chamadas de:', apiUrl);
      
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
        console.error('Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
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
          const isValid = call.Accountcode === userId && ['Ring', 'Up'].includes(call.State);
          if (!isValid) {
            console.log('Chamada filtrada:', { call, userId });
          }
          return isValid;
        })
        .map(call => ({
          id: call.Channel, // Usando o Channel como ID único
          callerid: call.CallerID,
          duracao: call.Duration,
          destino: call.Extension,
          status: translateState(call.State),
          ramal: extractRamal(call.Channel),
          channel: call.Channel,
          user_id: userId, // Adicionando user_id para RLS
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      console.log('Chamadas processadas:', processedCalls);

      // Salva as chamadas no banco
      if (processedCalls.length > 0) {
        try {
          // Primeiro, remove chamadas antigas deste usuário
          const { error: deleteError } = await supabase
            .from('active_calls')
            .delete()
            .eq('user_id', userId);

          if (deleteError) {
            console.error('Erro ao limpar chamadas antigas:', deleteError);
          }

          // Depois, insere as novas chamadas
          const { error: insertError } = await supabase
            .from('active_calls')
            .insert(processedCalls);

          if (insertError) {
            console.error('Erro ao inserir novas chamadas:', insertError);
            // Não retornamos erro aqui para não afetar a UI
          }
        } catch (error) {
          console.error('Erro ao sincronizar com Supabase:', error);
        }
      } else {
        // Se não há chamadas ativas, limpa a tabela para este usuário
        try {
          const { error: deleteError } = await supabase
            .from('active_calls')
            .delete()
            .eq('user_id', userId);

          if (deleteError) {
            console.error('Erro ao limpar chamadas:', deleteError);
          }
        } catch (error) {
          console.error('Erro ao limpar Supabase:', error);
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
    queryKey: ['active-calls', userId],
    queryFn: fetchCalls,
    refetchInterval: 5000,
    enabled: !!userId && !!API_URL,
    retry: 1,
    retryDelay: 1000,
    staleTime: 2000,
    cacheTime: 0,
    refetchOnWindowFocus: false,
  });
}
