import { useQuery } from '@tanstack/react-query';

interface RamalStatus {
  agent_name: string;
  in_call: boolean;
  ramal: string;
  status: string;
}

export function useExtensionStatus(ramal?: string) {
  return useQuery({
    queryKey: ['extensionStatus', ramal],
    queryFn: async () => {
      if (!ramal) return { status: 'unknown' };

      try {
        const apiUrl = `https://intermed.appinovavoip.com:3000/ramais?ramal=${ramal}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': '191e8a1e-d313-4e12-b608-d1a759b1a106'
          }
        });

        if (!response.ok) {
          console.warn(`Failed to fetch extension status for ramal ${ramal}: ${response.status}`);
          return { status: 'unknown' };
        }

        const data = await response.json();
        
        // Se data não for um array ou estiver vazio
        if (!Array.isArray(data) || data.length === 0) {
          return { status: 'unknown' };
        }

        const status = data[0];

        return {
          status: status.in_call ? 'em chamada' : status.status === 'online' ? 'online (livre)' : status.status,
          agent_name: status.agent_name || '',
          in_call: status.in_call || false,
          ramal: status.ramal
        };

      } catch (error) {
        console.error('Erro ao buscar status do ramal:', error);
        return { status: 'unknown' };
      }
    },
    refetchInterval: 5000,
    enabled: !!ramal,
    staleTime: 4000,
    cacheTime: 1000 * 60 * 5,
    retry: false, // Não tenta novamente em caso de erro
    retryOnMount: false // Não tenta novamente ao montar
  });
}
