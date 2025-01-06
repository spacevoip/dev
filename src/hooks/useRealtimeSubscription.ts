import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';

export const useRealtimeSubscription = (accountId: string | undefined) => {
  const { setTotalCalls, setTotalExtensions, setExtensionLimit, fetchInitialData } = useAppStore();

  useEffect(() => {
    if (!accountId) return;

    // Busca dados iniciais
    fetchInitialData(accountId);

    // Inscrição para mudanças em chamadas
    const cdrChannel = supabase.channel('cdr-changes');
    const extensionsChannel = supabase.channel('extensions-changes');
    const userChannel = supabase.channel('user-changes');

    cdrChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cdr',
          filter: `accountid=eq.${accountId}`,
        },
        async () => {
          const { count } = await supabase
            .from('cdr')
            .select('*', { count: 'exact', head: true })
            .eq('accountid', accountId);
          setTotalCalls(count || 0);
        }
      )
      .subscribe();

    extensionsChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'extensions',
          filter: `accountid=eq.${accountId}`,
        },
        async () => {
          const { count } = await supabase
            .from('extensions')
            .select('*', { count: 'exact', head: true })
            .eq('accountid', accountId);
          setTotalExtensions(count || 0);
        }
      )
      .subscribe();

    userChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `accountid=eq.${accountId}`,
        },
        async () => {
          const { data } = await supabase
            .from('users')
            .select('limite')
            .eq('accountid', accountId)
            .single();
          setExtensionLimit(data?.limite || 0);
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      cdrChannel.unsubscribe();
      extensionsChannel.unsubscribe();
      userChannel.unsubscribe();
    };
  }, [accountId, fetchInitialData, setTotalCalls, setTotalExtensions, setExtensionLimit]);
};
