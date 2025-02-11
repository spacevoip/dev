import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalExtensions: number;
  activeExtensions: number;
  totalCDR: number;
  expiredPlans: number;
  revenue: string;
}

interface ChartData {
  labels: string[];
  values: number[];
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  status: string;
  plano: string;
}

interface RecentCall {
  id: string;
  channel: string;
  dst: string;
  start: string;
  billsec: number;
  disposition: string;
}

const initialMetrics: DashboardMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  totalExtensions: 0,
  activeExtensions: 0,
  totalCDR: 0,
  expiredPlans: 0,
  revenue: 'R$ 0,00'
};

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [usersChart, setUsersChart] = useState<ChartData>({ labels: [], values: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar métricas
      const [
        { data: usersData },
        { data: activeData },
        { data: inactiveData },
        { data: extensionsData },
        { data: activeExtData },
        { data: cdrData },
        { data: payments },
        { data: plansData },
        { data: usersWithPlans }
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('users').select('*').or('status.eq.ativo,status.eq.active'),
        supabase.from('users').select('*').or('status.eq.inactive,status.eq.inativo'),
        supabase.from('extensions').select('*'),
        supabase.from('extensions')
          .select('*')
          .or('snystatus.ilike.%online%,snystatus.ilike.%inuse%,snystatus.ilike.%incall%'),
        supabase.from('cdr').select('*'),
        supabase.from('pagamentos').select('valor'),
        supabase.from('planos').select('*'),
        supabase.from('users').select('*, planos(validade)').eq('status', 'active')
      ]);

      const totalRevenue = payments?.reduce((acc, payment) => acc + (Number(payment.valor) || 0), 0) || 0;
      const revenue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(totalRevenue);

      // Calcular planos vencidos
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const expiredCount = usersWithPlans?.filter(user => {
        if (!user.created_at || !user.plano) return false;

        const userPlan = plansData?.find(p => p.nome === user.plano);
        if (!userPlan?.validade) return false;

        const createdAt = new Date(user.created_at);
        createdAt.setHours(0, 0, 0, 0);
        
        const validityDays = parseInt(String(userPlan.validade));
        const expirationDate = new Date(createdAt);
        expirationDate.setDate(createdAt.getDate() + validityDays);
        expirationDate.setHours(0, 0, 0, 0);

        return currentDate > expirationDate;
      }).length || 0;

      setMetrics({
        totalUsers: usersData?.length || 0,
        activeUsers: activeData?.length || 0,
        inactiveUsers: inactiveData?.length || 0,
        totalExtensions: extensionsData?.length || 0,
        activeExtensions: activeExtData?.length || 0,
        totalCDR: cdrData?.length || 0,
        expiredPlans: expiredCount,
        revenue
      });

      // Buscar dados para o gráfico
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thirtyDaysAgo = new Date(todayStart);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

      const { data: chartUsers } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .lte('created_at', now.toISOString());

      const usersByDay = new Map<string, number>();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(todayStart);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        usersByDay.set(dateStr, 0);
      }

      chartUsers?.forEach(user => {
        if (user?.created_at) {
          const dateStr = new Date(user.created_at).toISOString().split('T')[0];
          if (usersByDay.has(dateStr)) {
            usersByDay.set(dateStr, (usersByDay.get(dateStr) || 0) + 1);
          }
        }
      });

      const sortedUsersData = Array.from(usersByDay.entries())
        .sort(([a], [b]) => a.localeCompare(b));

      setUsersChart({
        labels: sortedUsersData.map(([date]) => formatDate(date)),
        values: sortedUsersData.map(([, count]) => count)
      });

      // Buscar usuários recentes
      const { data: latestUsers } = await supabase
        .from('users')
        .select('id, name, email, created_at, status, plano')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentUsers(latestUsers || []);

      // Buscar chamadas recentes
      const { data: latestCalls } = await supabase
        .from('cdr')
        .select('id, channel, dst, start, billsec, disposition')
        .order('start', { ascending: false })
        .limit(5);

      setRecentCalls((latestCalls || []).map(call => ({
        ...call,
        channel: call.channel?.split('PJSIP/')[1]?.split('-')[0] || call.channel,
        dst: call.dst?.replace(/^sip:/, '') || call.dst
      })));

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    recentUsers,
    recentCalls,
    usersChart,
    isLoading,
    error,
    lastUpdate,
    refreshData: fetchData
  };
}
