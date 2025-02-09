import { supabase } from './supabase';
import type { AgentStatus } from './agentStatus';

export interface AgentUser {
  id: string;
  numero: string;
  nome: string;
  status: 'ativo' | 'inativo';
  stagente: AgentStatus;
  accountid: string;
}

export interface AgentLoginData {
  numero: string;
  senha: string;
}

export const loginAgent = async (data: AgentLoginData): Promise<{ agent: AgentUser | null; error: string | null }> => {
  try {
    // Validar o ramal e senha na tabela extensions
    const { data: agent, error: queryError } = await supabase
      .from('extensions')
      .select('*')
      .eq('numero', data.numero)
      .eq('senha', data.senha)
      .single();

    if (queryError) {
      return {
        agent: null,
        error: 'Erro ao validar credenciais. Por favor, tente novamente.'
      };
    }

    if (!agent) {
      return {
        agent: null,
        error: 'Ramal ou senha inválidos. Por favor, verifique suas credenciais.'
      };
    }

    // Verificar se o ramal está ativo
    if (agent.status !== 'ativo') {
      return {
        agent: null,
        error: 'Este ramal está inativo. Entre em contato com o administrador.'
      };
    }

    // Atualizar o último login do agente e definir status inicial como offline
    await supabase
      .from('extensions')
      .update({ 
        last_login: new Date().toISOString(),
        stagente: 'offline'
      })
      .eq('id', agent.id);

    return {
      agent,
      error: null
    };

  } catch (err) {
    console.error('Erro no login do agente:', err);
    return {
      agent: null,
      error: 'Erro inesperado ao fazer login. Por favor, tente novamente.'
    };
  }
};

export const updateAgentCallerID = async (agentId: number, newCallerID: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('extensions')
      .update({ callerid: newCallerID })
      .eq('id', agentId);

    if (error) {
      return {
        success: false,
        error: 'Erro ao atualizar CallerID. Por favor, tente novamente.'
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro inesperado ao atualizar CallerID.'
    };
  }
};
