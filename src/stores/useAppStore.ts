import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type AppStore = {
  totalCalls: number;
  totalExtensions: number;
  extensionLimit: number;
  loading: boolean;
  initialized: boolean;
  setTotalCalls: (total: number) => void;
  setTotalExtensions: (total: number) => void;
  setExtensionLimit: (limit: number) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  fetchInitialData: (accountId: string) => Promise<void>;
};

export const useAppStore = create<AppStore>((set) => ({
  totalCalls: 0,
  totalExtensions: 0,
  extensionLimit: 0,
  loading: true,
  initialized: false,
  
  setTotalCalls: (total) => set({ totalCalls: total }),
  setTotalExtensions: (total) => set({ totalExtensions: total }),
  setExtensionLimit: (limit) => set({ extensionLimit: limit }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  fetchInitialData: async (accountId: string) => {
    const { initialized } = useAppStore.getState();
    if (initialized) return;

    try {
      set({ loading: true });

      // Busca total de chamadas
      const { count: callsCount } = await supabase
        .from('cdr')
        .select('*', { count: 'exact', head: true })
        .eq('accountid', accountId);

      // Busca total de ramais
      const { count: extensionsCount } = await supabase
        .from('extensions')
        .select('*', { count: 'exact', head: true })
        .eq('accountid', accountId);

      // Busca o limite de ramais do usuário
      const { data: userData } = await supabase
        .from('users')
        .select('limite')
        .eq('accountid', accountId)
        .single();

      set({
        totalCalls: callsCount || 0,
        totalExtensions: extensionsCount || 0,
        extensionLimit: userData?.limite || 0,
        initialized: true,
      });

    } catch (err) {
      console.error('Erro ao buscar dados iniciais:', err);
    } finally {
      set({ loading: false });
    }
  },
}));
