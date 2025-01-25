import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Interface para informações de vencimento
interface ExpirationInfo {
  expirationDate: Date;
  isExpired: boolean;
  daysUntilExpiration: number;
  formattedDate: string;
  formattedDateTime: string;
  status: 'expired' | 'warning' | 'active';
  statusText: string;
  progressPercentage: number;
}

// Função para calcular o status de vencimento
const calculateExpirationStatus = (createdAt: string, validity: number): ExpirationInfo => {
  // Obter a data atual sem as horas para comparação justa
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // Converter a data de criação e remover as horas
  const createdDate = new Date(createdAt);
  createdDate.setHours(0, 0, 0, 0);
  
  // Calcular a data de vencimento (data de criação + dias de validade - 1)
  // Subtraímos 1 porque o dia do cadastro conta como primeiro dia
  const expirationDate = new Date(createdDate);
  expirationDate.setDate(createdDate.getDate() + (validity - 1));
  expirationDate.setHours(23, 59, 59, 999); // Vence no final do dia
  
  // Calcular dias até o vencimento
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = now > expirationDate;
  
  // Calcular porcentagem de progresso
  const totalDays = validity;
  const daysElapsed = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

  // Determinar o status
  let status: 'expired' | 'warning' | 'active';
  let statusText: string;

  if (isExpired) {
    status = 'expired';
    const days = Math.abs(daysUntilExpiration);
    statusText = `Vencido há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  } else if (daysUntilExpiration <= 7) {
    status = 'warning';
    if (daysUntilExpiration === 0) {
      statusText = 'Vence hoje';
    } else if (daysUntilExpiration === 1) {
      statusText = 'Vence amanhã';
    } else {
      statusText = `Vence em ${daysUntilExpiration} dias`;
    }
  } else {
    status = 'active';
    statusText = `${daysUntilExpiration} dias restantes`;
  }

  return {
    expirationDate,
    isExpired,
    daysUntilExpiration,
    formattedDate: expirationDate.toLocaleDateString('pt-BR'),
    formattedDateTime: expirationDate.toLocaleString('pt-BR'),
    status,
    statusText,
    progressPercentage
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar todos os usuários com seus planos
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('id, name, created_at, plano')
      .is('deleted_at', null)

    if (usersError) throw usersError

    const results = [];

    // Para cada usuário, verificar o vencimento do plano
    for (const user of users) {
      if (!user.created_at || !user.plano) continue

      // Buscar a validade do plano
      const { data: planData } = await supabaseClient
        .from('planos')
        .select('validade')
        .eq('nome', user.plano)
        .single()

      if (!planData?.validade) continue

      // Usar a mesma função do PlanCard para calcular o vencimento
      const expirationInfo = calculateExpirationStatus(user.created_at, planData.validade);

      results.push({
        userId: user.id,
        name: user.name,
        plano: user.plano,
        expirationInfo
      });

      // Se for um caso de notificação, criar a notificação
      let notification = null;

      if (expirationInfo.status === 'warning' && expirationInfo.daysUntilExpiration > 1) {
        notification = {
          title: 'Seu plano está próximo do vencimento',
          message: `Faltam ${expirationInfo.daysUntilExpiration} dias para o vencimento do seu plano. Renove agora para evitar interrupções.`,
          type: 'warning',
        };
      } else if (expirationInfo.daysUntilExpiration === 1) {
        notification = {
          title: 'Seu Plano Vence Amanhã',
          message: 'Seu Plano Vence Amanhã, Renove Agora',
          type: 'warning',
        };
      } else if (expirationInfo.isExpired) {
        notification = {
          title: 'Plano Vencido',
          message: 'Seu Plano está vencido, renove agora e evite que seus ramais sejam excluidos!',
          type: 'error',
        };
      }

      if (notification) {
        await supabaseClient
          .from('notifications')
          .insert({
            ...notification,
            userId: user.id,
            read: false,
            timestamp: new Date().toISOString(),
          })
      }
    }

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
