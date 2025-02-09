import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

export type AgentStatus = 'available' | 'busy' | 'offline' | 'pause';

export const updateAgentStatus = async (agentId: string, status: AgentStatus): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('extensions')
      .update({ stagente: status })
      .eq('id', agentId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
      return false;
    }

    const statusMessages = {
      available: 'Você está disponível para chamadas',
      busy: 'Você está ocupado',
      offline: 'Você está offline',
      pause: 'Você está em pausa'
    };

    toast.success(statusMessages[status]);
    return true;
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    toast.error('Erro ao atualizar status');
    return false;
  }
};
