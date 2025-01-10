import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Queue } from '../types/Queue';
import { supabase } from '../lib/supabase';

export interface Extension {
  id: string;
  numero: string;
  nome: string;
  snystatus: string;
  accountid: string;
}

export const useQueuesRealtime = () => {
  const { user } = useAuth();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar filas
  const fetchQueues = async (accountId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('accountid', accountId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQueues(data || []);
    } catch (error) {
      console.error('Error fetching queues:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar filas');
    } finally {
      setLoading(false);
    }
  };

  // Configurar subscription em tempo real
  useEffect(() => {
    if (!user?.accountid) return;

    // Busca inicial
    fetchQueues(user.accountid);

    // Inscrever para mudanças em tempo real
    const subscription = supabase
      .channel('queues_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta todos os eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'queues',
          filter: `accountid=eq.${user.accountid}`,
        },
        async (payload) => {
          console.log('Realtime change received:', payload);

          // Atualizar os dados após qualquer mudança
          await fetchQueues(user.accountid);
        }
      )
      .subscribe();

    // Cleanup: remover subscription quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.accountid]);

  // Função para atualizar status
  const updateQueueStatus = async (queueId: string, newStatus: Queue['status']) => {
    try {
      const { error } = await supabase
        .from('queues')
        .update({ status: newStatus })
        .eq('id', queueId)
        .eq('accountid', user?.accountid);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating queue status:', error);
      throw error;
    }
  };

  // Função para criar fila
  const createQueue = async (queueData: Omit<Queue, 'id' | 'created_at' | 'accountid'>) => {
    try {
      if (!user?.accountid) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('queues')
        .insert([
          {
            ...queueData,
            accountid: user.accountid,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating queue:', error);
      throw error;
    }
  };

  // Função para atualizar fila
  const updateQueue = async (queueId: string, queueData: Partial<Omit<Queue, 'id' | 'created_at' | 'accountid'>>) => {
    try {
      const { error } = await supabase
        .from('queues')
        .update(queueData)
        .eq('id', queueId)
        .eq('accountid', user?.accountid);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating queue:', error);
      throw error;
    }
  };

  // Função para deletar fila
  const deleteQueue = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from('queues')
        .delete()
        .eq('id', queueId)
        .eq('accountid', user?.accountid);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting queue:', error);
      throw error;
    }
  };

  return {
    queues,
    loading,
    error,
    createQueue,
    updateQueue,
    deleteQueue,
    updateQueueStatus,
    refetch: () => user?.accountid && fetchQueues(user.accountid),
  };
};
