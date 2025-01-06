import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';

// Usando a variável de ambiente do Vite
const API_URL = import.meta.env.VITE_API_URL;

export interface Extension {
  id: string;
  extension: string;
  name: string;
  status: string;
  callerid: string;
}

export const useExtensions = () => {
  const { user } = useAuth();
  const accountId = user?.accountid;

  return useQuery({
    queryKey: ['extensions', accountId],
    queryFn: async (): Promise<Extension[]> => {
      if (!accountId) {
        return [];
      }

      try {
        const response = await fetch(`${API_URL}/extensions`);
        if (!response.ok) {
          throw new Error('Erro ao buscar ramais');
        }
        
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Erro ao buscar ramais:', error);
        return [];
      }
    },
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
};
