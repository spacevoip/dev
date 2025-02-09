import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DIDDisponivel } from '../types/didsDisponiveis';

export const useDIDsDisponiveis = () => {
  const [dids, setDids] = useState<DIDDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDIDs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('didsdisponiveis')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        setDids(data || []);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar DIDs disponíveis:', err);
        setError('Erro ao carregar DIDs disponíveis');
      } finally {
        setLoading(false);
      }
    };

    fetchDIDs();
  }, []);

  return { dids, loading, error };
};
