import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Queue } from '../types/Queue';
import { supabase } from '../lib/supabase';

export const useQueues = () => {
  const { user } = useAuth();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueues = async (accountId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('accountid', accountId);

      if (error) throw error;

      setQueues(data || []);
    } catch (error) {
      console.error('Error fetching queues:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar filas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.accountid) {
      fetchQueues(user.accountid);
    }
  }, [user?.accountid]);

  return {
    queues,
    loading,
    error,
    refetch: fetchQueues
  };
};
