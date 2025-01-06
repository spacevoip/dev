import axios from 'axios';
import CryptoJS from 'crypto-js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://91.108.125.149:5000',
  withCredentials: true // Habilitando cookies cross-origin
});

// Chave secreta para criptografia (mova para .env em produção)
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'your-secret-key-123';

// Função para gerar um timestamp aleatório
const getRandomTimestamp = () => {
  const base = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return base + random;
};

// Função para gerar um ID de requisição aleatório
const generateRequestId = () => {
  return Math.random().toString(36).substring(7) + Date.now().toString(36);
};

// Função para criptografar dados
const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// Função para descriptografar dados
const decryptData = (encryptedData: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Função para codificar endpoint com múltiplas camadas
const encodeEndpoint = (endpoint: string) => {
  // Primeira camada: Base64
  const base64 = Buffer.from(endpoint).toString('base64');
  // Segunda camada: Reverter string
  const reversed = base64.split('').reverse().join('');
  // Terceira camada: Substituir caracteres
  return reversed.replace(/=/g, '$').replace(/\+/g, '-').replace(/\//g, '_');
};

// Lista de user agents para simular diferentes navegadores
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

// Interceptor para todas as requisições
api.interceptors.request.use(
  (config) => {
    // Adiciona timestamp e request ID
    const timestamp = getRandomTimestamp();
    const requestId = generateRequestId();
    
    // Adiciona headers de segurança
    config.headers['X-Request-Time'] = timestamp;
    config.headers['X-Request-ID'] = requestId;
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['Accept'] = 'application/json';
    config.headers['User-Agent'] = userAgents[Math.floor(Math.random() * userAgents.length)];

    // Se for uma requisição POST, criptografa o body
    if (config.data) {
      config.data = {
        encryptedData: encryptData(config.data)
      };
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para todas as respostas
api.interceptors.response.use(
  (response) => {
    // Descriptografa a resposta se necessário
    if (response.data && response.data.encryptedData) {
      try {
        response.data = decryptData(response.data.encryptedData);
      } catch (e) {
        // Se não conseguir descriptografar, retorna os dados originais
      }
    }
    return response;
  },
  (error) => {
    console.error('Erro na requisição');
    return Promise.reject(error);
  }
);

// Funções para as chamadas específicas
export const getActiveCalls = async () => {
  try {
    const response = await api.get(encodeEndpoint('/active-calls'));
    return response.data;
  } catch (error) {
    console.error('Erro na requisição');
    throw error;
  }
};

export const hangupCall = async (channel: string) => {
  try {
    const response = await api.post(encodeEndpoint('/hangup-call'), { channel });
    return response.data;
  } catch (error) {
    console.error('Erro na requisição');
    throw error;
  }
};

export default api;
