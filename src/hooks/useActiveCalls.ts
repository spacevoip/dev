import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import type { ApiCall, ActiveCall } from '../types/activeCalls';

// Função auxiliar para extrair o ramal do Channel
function extractRamal(channel: string): string {
  const match = channel.match(/PJSIP\/(\d{4})/);
  return match ? match[1] : '';
}

// Função auxiliar para traduzir o estado
function translateState(state: string): string {
  switch (state.toLowerCase()) {
    case 'ring':
      return 'Chamando';
    case 'up':
      return 'Falando';
    case 'down':
      return 'Desligada';
    default:
      return state;
  }
}

// Função para extrair ID único da chamada
function extractCallId(call: ApiCall): string {
  // Usa uma combinação de CallerID e Extension para identificar a chamada única
  return `${call.CallerID}-${call.Extension}`;
}

interface UseActiveCallsOptions {
  select?: (data: ActiveCall[]) => any;
  staleTime?: number;
}

export function useActiveCalls(options: UseActiveCallsOptions = {}) {
  const { user } = useAuth();
  const accountId = user?.accountid;

  return useQuery({
    queryKey: ['activeCalls', accountId],
    queryFn: async () => {
      if (!accountId) {
        return [];
      }

      try {
        const apiUrl = `https://intermed.appinovavoip.com:3000/active-calls?accountid=${accountId}`;
        
        // Busca as chamadas da API com timeout de 10 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': '191e8a1e-d313-4e12-b608-d1a759b1a106'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch active calls: ${response.status} ${response.statusText}`);
        }

        const calls: ApiCall[] = await response.json();

        // Verifica se calls é um array
        if (!Array.isArray(calls)) {
          console.error('Formato de resposta inválido:', calls);
          return [];
        }

        // Log para debug
        console.log('Chamadas recebidas:', calls);

        // Agrupa chamadas únicas sem filtrar por Application
        const uniqueCalls = calls.reduce((acc: ApiCall[], call: ApiCall) => {
          const callId = extractCallId(call);
          
          // Procura se já existe uma chamada com o mesmo ID
          const existingCallIndex = acc.findIndex(
            (existing) => extractCallId(existing) === callId
          );

          if (existingCallIndex === -1) {
            // Se não existe, adiciona a chamada
            acc.push(call);
          } else if (call.State.toLowerCase() === 'up') {
            // Se existe e a nova chamada está 'Up', substitui a existente
            acc[existingCallIndex] = call;
          }

          return acc;
        }, []);

        // Log para debug
        console.log('Chamadas únicas após deduplicação:', uniqueCalls);

        // Formata as chamadas únicas
        const formattedCalls: ActiveCall[] = uniqueCalls.map(
          (call: ApiCall) => ({
            channel: call.Channel,
            callerid: call.CallerID,
            duracao: call.Duration,
            destino: call.Extension,
            status: translateState(call.State),
            ramal: extractRamal(call.Channel)
          })
        );

        // Log final para debug
        console.log('Chamadas formatadas:', formattedCalls);

        return formattedCalls;

      } catch (error) {
        console.error('Erro ao buscar chamadas ativas:', error);
        return [];
      }
    },
    refetchInterval: 5000,
    enabled: !!accountId,
    staleTime: options.staleTime,
    select: options.select,
  });
}
