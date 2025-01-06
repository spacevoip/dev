import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Sempre considera os dados stale
      cacheTime: 0, // Não mantém cache
      refetchOnWindowFocus: true, // Refetch quando a janela ganha foco
      retry: 3, // Tenta 3 vezes antes de falhar
      retryDelay: 1000, // Espera 1 segundo entre tentativas
      refetchInterval: false, // Não refetch automático por padrão
    },
  },
});
