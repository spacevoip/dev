import { supabase } from '../lib/supabase';

export interface QueueData {
  id: string;
  created_at: string;
  nome: string;
  estrategia: string;
  ramais: string;
  accountid: string;
  status: string;
}

interface QueueDataFormatted extends Omit<QueueData, 'ramais' | 'status'> {
  ramais: string[];
  status: 'active' | 'inactive' | 'paused';
}

function formatQueueData(queue: QueueData): QueueDataFormatted {
  return {
    ...queue,
    ramais: queue.ramais.split(',').map(ramal => ramal.trim()),
    status: formatStatus(queue.status)
  };
}

function formatStatus(status: string): 'active' | 'inactive' | 'paused' {
  switch (status.toLowerCase()) {
    case 'ativo':
      return 'active';
    case 'inativo':
      return 'inactive';
    case 'pausado':
      return 'paused';
    default:
      return 'inactive';
  }
}

export async function fetchQueues(accountId: string): Promise<QueueDataFormatted[]> {
  try {
    console.log('Fetching queues with accountId:', accountId); // Debug

    const { data, error } = await supabase
      .from('queues')
      .select(`
        id,
        created_at,
        nome,
        estrategia,
        ramais,
        accountid,
        status
      `)
      .eq('accountid', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error); // Debug
      throw error;
    }

    console.log('Queues fetched:', data); // Debug
    return (data || []).map(formatQueueData);
  } catch (err) {
    console.error('Error fetching queues:', err);
    throw err;
  }
}

export async function updateQueueStatus(
  queueId: string,
  accountId: string,
  status: QueueDataFormatted['status']
): Promise<boolean> {
  const dbStatus = status === 'active' ? 'Ativo' : 
                  status === 'inactive' ? 'Inativo' : 'Pausado';

  try {
    const { error } = await supabase
      .from('queues')
      .update({ status: dbStatus })
      .match({ id: queueId, accountid: accountId });

    if (error) {
      console.error('Error updating queue status:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error updating queue status:', err);
    throw err;
  }
}

export async function createQueue(
  queue: Omit<QueueDataFormatted, 'id' | 'created_at'>
): Promise<QueueDataFormatted> {
  const dbQueue = {
    ...queue,
    ramais: queue.ramais.join(','),
    status: queue.status === 'active' ? 'Ativo' : 
           queue.status === 'inactive' ? 'Inativo' : 'Pausado'
  };

  try {
    const { data, error } = await supabase
      .from('queues')
      .insert([dbQueue])
      .select()
      .single();

    if (error) {
      console.error('Error creating queue:', error);
      throw error;
    }

    return formatQueueData(data);
  } catch (err) {
    console.error('Error creating queue:', err);
    throw err;
  }
}

export async function deleteQueue(queueId: string, accountId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('queues')
      .delete()
      .match({ id: queueId, accountid: accountId });

    if (error) {
      console.error('Error deleting queue:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting queue:', err);
    throw err;
  }
}

export const apiFetchQueues = async (accountid: string) => {
  try {
    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .eq('accountid', accountid);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Garantir que ramais é sempre uma string
    const processedData = data?.map(queue => ({
      ...queue,
      ramais: queue.ramais?.toString() || ''
    }));

    console.log('Processed queues data:', processedData);
    return { data: processedData, error: null };
  } catch (error) {
    console.error('Error in apiFetchQueues:', error);
    return { data: null, error };
  }
};
