import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ActiveCall {
  Accountcode: string;
  Application: string;
  BridgeID: string;
  CallerID: string;
  Channel: string;
  Context: string;
  Data: string;
  Duration: string;
  Extension: string;
  PeerAccount: string;
  Prio: string;
  State: string;
}

// Função para buscar métricas do Supabase
async function fetchDashboardMetrics() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const { data: users } = await supabase
    .from('users')
    .select('*');

  const { data: activeUsers } = await supabase
    .from('users')
    .select('*')
    .eq('status', 'active');

  const { data: inactiveUsers } = await supabase
    .from('users')
    .select('*')
    .eq('status', 'inactive');

  const { data: newUsers } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString());

  return {
    totalUsers: users?.length || 0,
    activeUsers: activeUsers?.length || 0,
    inactiveUsers: inactiveUsers?.length || 0,
    newUsers: newUsers?.length || 0,
  };
}

// Função para buscar chamadas ativas
async function fetchActiveCalls() {
  try {
    const response = await fetch('/api/active-calls', {
      headers: {
        'x-api-key': '191e8a1e-d313-4e12-b608-d1a759b1a106'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar chamadas ativas');
    }

    const data = await response.json();
    
    // Verificar se data é um array
    if (!Array.isArray(data)) {
      console.error('Dados recebidos não são um array:', data);
      return {
        activeCalls: [],
        totalCalls: 0,
        callingCalls: 0,
        talkingCalls: 0,
      };
    }

    const activeCalls = data.filter(call => call && call.Application === "Dial");
    
    return {
      activeCalls,
      totalCalls: activeCalls.length,
      callingCalls: activeCalls.filter(call => call && call.State === "Ring").length,
      talkingCalls: activeCalls.filter(call => call && call.State === "Up").length,
    };
  } catch (error) {
    console.error('Erro ao buscar chamadas ativas:', error);
    return {
      activeCalls: [],
      totalCalls: 0,
      callingCalls: 0,
      talkingCalls: 0,
    };
  }
}

// Função para buscar dados de usuários por dia
async function fetchUsersPerDay() {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const { data: users } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at');

    const usersByDay = new Map();
    const labels: string[] = [];
    const values: number[] = [];

    // Criar array de datas dos últimos 30 dias
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      usersByDay.set(dateStr, 0);
    }

    // Contar usuários por dia
    if (users) {
      users.forEach(user => {
        if (user.created_at) {
          const dateStr = new Date(user.created_at).toISOString().split('T')[0];
          usersByDay.set(dateStr, (usersByDay.get(dateStr) || 0) + 1);
        }
      });
    }

    // Converter para arrays ordenados
    Array.from(usersByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([date, count]) => {
        labels.push(new Date(date).toLocaleDateString('pt-BR'));
        values.push(count);
      });

    return { labels, values };
  } catch (error) {
    console.error('Error fetching users per day:', error);
    return { labels: [], values: [] };
  }
}

// Hooks personalizados
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}

export function useActiveCalls() {
  return useQuery({
    queryKey: ['activeCalls'],
    queryFn: fetchActiveCalls,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
}

export function useUsersPerDay() {
  return useQuery({
    queryKey: ['usersPerDay'],
    queryFn: fetchUsersPerDay,
    refetchInterval: 60000, // Atualiza a cada minuto
  });
}
