import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // Dados considerados obsoletos após 30 segundos
      cacheTime: 3600000, // Cache mantido por 1 hora
      refetchOnWindowFocus: false, // Desabilita refetch no foco da janela (será controlado pelo background sync)
      retry: 2, // Número de tentativas em caso de falha
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
      refetchInterval: false, // Intervalo controlado pelo background sync
    },
  },
});

// Configuração global de callbacks
queryClient.setDefaultOptions({
  mutations: {
    onError: (error: any) => {
      console.error('Mutation error:', error);
      // Aqui você pode adicionar notificações de erro globais
    },
  },
});
