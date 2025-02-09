import { supabase } from '../lib/supabase';
import type { NotificationType } from '../hooks/useNotifications';

export const createTestNotification = async (
  userId: string,
  type: NotificationType = 'info',
  title: string,
  message: string
) => {
  try {
    const { error } = await supabase.from('notifications').insert({
      userId,
      type,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString()
    });

    if (error) throw error;
    
    console.log('Notificação de teste criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar notificação de teste:', error);
  }
};

// Exemplos de uso:
export const createExampleNotifications = async (userId: string) => {
  await createTestNotification(
    userId,
    'info',
    'Bem-vindo ao sistema!',
    'Estamos felizes em tê-lo conosco. Explore todas as funcionalidades disponíveis.'
  );

  await createTestNotification(
    userId,
    'warning',
    'Limite de ramais próximo',
    'Você está próximo de atingir o limite de ramais do seu plano.'
  );

  await createTestNotification(
    userId,
    'error',
    'Falha na chamada',
    'Uma tentativa de chamada falhou. Verifique sua conexão.'
  );
};
