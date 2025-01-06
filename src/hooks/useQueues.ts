import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Queue } from '../types/Queue';
import { supabase } from '../lib/supabase';

export const useQueues = () => {
  const { user } = useAuth();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.accountid) {
        setError('Usuário não autenticado');
        return;
      }

      console.log('Fetching queues for accountId:', user.accountid);
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('accountid', user.accountid);

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message);
        return;
      }

      console.log('Fetched queues:', data);
      if (data) {
        // Garantir que ramais é sempre uma string
        const processedData = data.map(queue => ({
          ...queue,
          ramais: queue.ramais?.toString() || ''
        }));
        console.log('Processed queues:', processedData);
        setQueues(processedData);
      } else {
        setQueues([]);
      }
    } catch (err) {
      console.error('Error fetching queues:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar filas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.accountid) {
      fetchQueues();
    }
  }, [user?.accountid]);

  return {
    queues,
    loading,
    error,
    refetch: fetchQueues
  };
};
