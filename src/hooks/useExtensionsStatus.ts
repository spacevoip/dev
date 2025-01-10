import { useQueries } from '@tanstack/react-query';
import { Extension } from '../types';
import { supabase } from '../lib/supabase';

export const useExtensionsStatus = (extensions: Extension[]) => {
  const queries = useQueries({
    queries: extensions.map(ext => ({
      queryKey: ['extension', 'status', ext.numero],
      queryFn: async () => {
        if (!ext.numero) return { status: 'unknown' };
        
        try {
          const { data, error } = await supabase
            .from('extensions')
            .select('snystatus')
            .eq('numero', ext.numero)
            .single();

          if (error) throw error;
          
          return { status: data?.snystatus || 'unknown' };
        } catch (error) {
          console.warn(`Erro ao buscar status do ramal ${ext.numero}:`, error);
          return { status: 'unknown' };
        }
      },
      enabled: !!ext.numero,
      refetchInterval: 5000,
      retry: false
    }))
  });

  return extensions.reduce((acc, ext, index) => {
    acc[ext.numero] = queries[index]?.data?.status || 'unknown';
    return acc;
  }, {} as Record<string, string>);
};
