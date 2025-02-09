import axios from 'axios';
import type { AgentActiveCall } from '../hooks/useAgentActiveCalls';

interface ActiveCall {
  Accountcode: string;
  Application: string;
  BridgeID: string;
  CallerID: string;
  Channel: string;
  Context: string;
  Data: string;
  Duration: string;
  Extension: string;
  PeerAccount: string;
  Prio: string;
  State: string;
}

interface ApiResponse {
  active_calls: AgentActiveCall[];
}

const api = axios.create({
  baseURL: 'https://intermed.appinovavoip.com:3000',
  timeout: 5000, // timeout de 5 segundos
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-api-key': '191e8a1e-d313-4e12-b608-d1a759b1a106'
  }
});

// Cache para evitar requisições duplicadas
const cache = {
  data: null as AgentActiveCall[] | null,
  timestamp: 0,
  ttl: 2000 // 2 segundos de TTL
};

export const fetchActiveCalls = async (signal?: AbortSignal): Promise<AgentActiveCall[]> => {
  // Verifica cache
  const now = Date.now();
  if (cache.data && (now - cache.timestamp) < cache.ttl) {
    console.log('Retornando dados do cache:', cache.data);
    return cache.data;
  }

  try {
    console.log('Fazendo requisição para /active-calls');
    const response = await api.get('/active-calls', {
      signal,
      params: {
        adminpass: '35981517Biu', // Adicionado adminpass de volta
        _t: now // Evita cache do navegador
      }
    });

    console.log('Resposta bruta da API:', response.data);

    // A API pode retornar os dados de diferentes formas
    let calls: AgentActiveCall[] = [];
    
    if (Array.isArray(response.data)) {
      // Se a resposta já é um array
      calls = response.data;
    } else if (response.data.active_calls) {
      // Se a resposta tem a propriedade active_calls
      calls = response.data.active_calls;
    } else if (typeof response.data === 'object') {
      // Se a resposta é um objeto com as chamadas
      calls = [response.data];
    }

    console.log('Chamadas processadas:', calls);
    
    // Atualiza cache
    cache.data = calls;
    cache.timestamp = now;

    return calls;
  } catch (error: any) {
    // Limpa cache em caso de erro
    cache.data = null;
    cache.timestamp = 0;

    console.error('Erro completo:', error);

    // Se for erro de cancelamento, não é um erro real
    if (error.name === 'CanceledError' || error.message === 'canceled') {
      throw new Error('CANCELED');
    }

    if (axios.isAxiosError(error)) {
      // 404 significa sem chamadas, não é erro
      if (error.response?.status === 404) {
        console.log('404 retornando array vazio');
        return [];
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout ao buscar chamadas ativas');
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Erro de autenticação ao buscar chamadas');
      }

      // Outros erros HTTP
      const message = error.response?.data?.message || error.message;
      throw new Error(`Erro na requisição: ${message}`);
    }

    // Erros não-HTTP
    throw new Error('Erro ao conectar com o servidor');
  }
};
