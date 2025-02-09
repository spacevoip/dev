import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Call {
  id: string;
  status: string;
  created_at: string;
}

export const useCallsData = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('status', 'Up')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalls(data || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar chamadas:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();

    // Atualiza a cada 5 segundos
    const interval = setInterval(fetchCalls, 5000);

    return () => clearInterval(interval);
  }, []);

  return { calls, loading, error, refetch: fetchCalls };
};
