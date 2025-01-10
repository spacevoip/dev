import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// Mapeamento de rotas para suas queries correspondentes
const routeQueries: Record<string, string[][]> = {
  '/dash': [['activeCalls'], ['extensionsCount'], ['totalCalls']],
  '/extensions': [['extensions'], ['extensionsCount']],
  '/calls': [['activeCalls'], ['callsHistory']],
  '/history': [['callsHistory']],
  '/queues': [['queues'], ['queueCalls']],
  '/did': [['dids']],
};

// Prefetch de dados baseado na rota atual
const prefetchRouteData = async (queryClient: any, route: string) => {
  const queries = routeQueries[route];
  if (!queries) return;

  for (const queryKey of queries) {
    try {
      await queryClient.prefetchQuery({
        queryKey: queryKey,
        queryFn: () => Promise.resolve([])
      });
    } catch (error) {
      console.error(`Failed to prefetch ${queryKey}`, error);
      toast.error(`Erro ao carregar dados`);
    }
  }
};

export const useBackgroundSync = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    // Configurar listeners do Supabase para atualizações em tempo real
    const callsChannel = supabase
      .channel('calls-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calls' },
        () => {
          // Invalidar e atualizar queries relacionadas a chamadas
          queryClient.invalidateQueries({ queryKey: ['activeCalls'] });
          queryClient.invalidateQueries({ queryKey: ['callsHistory'] });
        }
      )
      .subscribe();

    const extensionsChannel = supabase
      .channel('extensions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'extensions' },
        () => {
          // Invalidar e atualizar queries relacionadas a ramais
          queryClient.invalidateQueries({ queryKey: ['extensions'] });
          queryClient.invalidateQueries({ queryKey: ['extensionsCount'] });
        }
      )
      .subscribe();

    const queuesChannel = supabase
      .channel('queues-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queues' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['queues'] });
          queryClient.invalidateQueries({ queryKey: ['queueCalls'] });
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      callsChannel.unsubscribe();
      extensionsChannel.unsubscribe();
      queuesChannel.unsubscribe();
    };
  }, [queryClient]);

  // Efeito para prefetch de dados quando a rota muda
  useEffect(() => {
    const currentRoute = location.pathname;
    prefetchRouteData(queryClient, currentRoute);
  }, [location.pathname, queryClient]);
};
