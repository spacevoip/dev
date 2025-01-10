import React, { useEffect, useState } from 'react';
import { Users, Phone, Clock, DollarSign, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Line } from 'react-chartjs-2';
import { ActiveCallsChart } from '@/components/Admin/Calls/ActiveCallsChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  recording_url: string | null;
  disposition: string;
}

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalExtensions: number;
  activeExtensions: number;
  totalCallMinutes: number;
  expiredPlans: number;
  revenue: string;
}

interface ChartData {
  labels: string[];
  values: {
    total: number[];
    calling: number[];
    talking: number[];
  };
}

interface UsersChartData {
  labels: string[];
  values: number[];
}

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

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalExtensions: 0,
    activeExtensions: 0,
    totalCallMinutes: 0,
    expiredPlans: 0,
    revenue: 'R$ 0'
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [callsChart, setCallsChart] = useState<ChartData>({
    labels: [],
    values: {
      total: [],
      calling: [],
      talking: []
    }
  });
  const [usersChart, setUsersChart] = useState<UsersChartData>({ labels: [], values: [] });
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 segundos
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchMetrics();
    fetchActiveCalls(); // Busca inicial

    const metricsInterval = setInterval(fetchMetrics, refreshInterval);
    const callsInterval = setInterval(fetchActiveCalls, 5000); // Atualiza a cada 5 segundos

    return () => {
      clearInterval(metricsInterval);
      clearInterval(callsInterval);
    };
  }, [refreshInterval]);

  // Função para verificar se a data é válida (não é 1969 ou anterior)
  const isValidDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getFullYear() > 1970;
  };

  async function fetchMetrics() {
    try {
      // Configurar datas considerando o fuso horário local
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thirtyDaysAgo = new Date(todayStart);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // -29 para incluir hoje

      // Buscar usuários e seus status
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;

      // Filtrar usuários com datas válidas
      const validUsers = users?.filter(u => u?.created_at && isValidDate(u.created_at)) || [];

      const activeUsers = validUsers.filter(u => u?.status === 'ativo').length;
      const inactiveUsers = validUsers.filter(u => u?.status === 'inactive').length;

      // Buscar ramais e seus status
      const { data: extensions, error: extensionsError } = await supabase
        .from('extensions')
        .select('*');

      if (extensionsError) throw extensionsError;

      const activeExtensions = extensions?.filter(e => e?.status === 'registered').length || 0;

      // Buscar chamadas dos últimos 30 dias
      const { data: calls, error: callsError } = await supabase
        .from('cdr')
        .select('*')
        .gte('start', thirtyDaysAgo.toISOString())
        .order('start', { ascending: true });

      if (callsError) throw callsError;

      // Filtrar chamadas com datas válidas
      const validCalls = calls?.filter(call => call?.start && isValidDate(call.start)) || [];

      // Calcular total de minutos em chamadas
      const totalMinutes = validCalls.reduce((acc, call) => acc + ((call?.billsec || 0) / 60), 0);

      // Calcular planos vencidos
      const expiredPlans = validUsers.filter(user => {
        if (!user?.created_at || !user?.plano || user?.status !== 'ativo') return false;
        const createdAt = new Date(user.created_at);
        const validityDays = 30; // Ajuste conforme necessário
        const expirationDate = new Date(createdAt);
        expirationDate.setDate(createdAt.getDate() + validityDays);
        return now > expirationDate;
      }).length;

      setMetrics({
        totalUsers: validUsers.length,
        activeUsers,
        inactiveUsers,
        totalExtensions: extensions?.length || 0,
        activeExtensions,
        totalCallMinutes: Math.round(totalMinutes),
        expiredPlans,
        revenue: 'R$ 0'
      });

      // Preparar dados para o gráfico de usuários
      const usersByDay = new Map<string, number>();

      // Inicializar map com os últimos 30 dias
      for (let i = 29; i >= 0; i--) {
        const date = new Date(todayStart);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        usersByDay.set(dateStr, 0);
      }

      // Preencher dados de usuários
      validUsers.forEach(user => {
        if (user?.created_at) {
          const localDate = new Date(user.created_at);
          const dateStr = localDate.toISOString().split('T')[0];
          if (usersByDay.has(dateStr)) {
            usersByDay.set(dateStr, (usersByDay.get(dateStr) || 0) + 1);
          }
        }
      });

      // Ordenar dados do gráfico
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

      // Buscar chamadas recentes
      const { data: latestCalls } = await supabase
        .from('cdr')
        .select('*')
        .order('start', { ascending: false })
        .limit(5);

      // Filtrar e formatar usuários recentes
      if (latestUsers) {
        const validLatestUsers = latestUsers
          .filter(user => user?.created_at && isValidDate(user.created_at))
          .slice(0, 5);
        setRecentUsers(validLatestUsers);
      }

      // Filtrar e formatar chamadas recentes
      if (latestCalls) {
        const validLatestCalls = latestCalls
          .filter(call => call?.start && isValidDate(call.start))
          .map(call => ({
            ...call,
            channel: call.channel && call.channel.split('PJSIP/')[1]?.substring(0, 4) || call.channel
          }))
          .slice(0, 5);
        setRecentCalls(validLatestCalls);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }

  async function fetchActiveCalls() {
    try {
      const response = await fetch('/api/active-calls');

      if (!response.ok) {
        throw new Error('Falha ao buscar chamadas ativas');
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Dados recebidos não são um array:', data);
        return;
      }
      
      // Filtrar apenas chamadas com Application = "Dial"
      const activeCalls = data.filter(call => call && call.Application === "Dial");
      
      const totalCalls = activeCalls.length;
      const callingCalls = activeCalls.filter(call => call && call.State === "Ring").length;
      const talkingCalls = activeCalls.filter(call => call && call.State === "Up").length;

      setCallsChart({
        labels: ['Chamadas Ativas'],
        values: {
          total: [totalCalls],
          calling: [callingCalls],
          talking: [talkingCalls]
        }
      });
    } catch (error) {
      console.error('Erro ao buscar chamadas ativas:', error);
    }
  }

  const stats = [
    {
      label: 'Total de Usuários',
      value: metrics.totalUsers.toString(),
      icon: Users,
      color: 'from-violet-500 to-fuchsia-500'
    },
    {
      label: 'Usuários Ativos',
      value: metrics.activeUsers.toString(),
      icon: UserCheck,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Usuários Inativos',
      value: metrics.inactiveUsers.toString(),
      icon: UserX,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Total de Ramais',
      value: metrics.totalExtensions.toString(),
      icon: Phone,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Ramais Ativos',
      value: metrics.activeExtensions.toString(),
      icon: Phone,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Minutos em Chamadas',
      value: metrics.totalCallMinutes.toString(),
      icon: Clock,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      label: 'Planos Vencidos',
      value: metrics.expiredPlans.toString(),
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Receita',
      value: metrics.revenue,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tendências',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  const handleDownloadCDR = async () => {
    try {
      const { data, error } = await supabase
        .from('cdr')
        .select('*')
        .order('start', { ascending: false });
      
      if (error) throw error;

      if (data) {
        const csv = data.map(row => {
          return `${row.start},${row.channel},${row.dst},${row.billsec},${row.disposition}`;
        }).join('\n');

        const header = 'Data,Origem,Destino,Duração,Status\n';
        const blob = new Blob([header + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cdr_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading CDR:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-500">Bem-vindo ao painel administrativo</p>
        </div>
        <div className="text-sm text-gray-500">
          Última atualização: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="relative bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-2xl"></div>
              <div className="relative flex items-center gap-4">
                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg shadow-violet-500/20`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveCallsChart />

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novos Usuários por Dia</h3>
          <Line
            options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    precision: 0
                  }
                }
              },
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 14
                  },
                  callbacks: {
                    title: (items) => {
                      if (items.length > 0) {
                        const date = new Date(sortedUsersData[items[0].dataIndex][0]);
                        return new Intl.DateTimeFormat('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }).format(date);
                      }
                      return '';
                    },
                    label: (item) => {
                      const value = parseInt(item.formattedValue);
                      if (value === 0) {
                        return 'Nenhum usuário cadastrado';
                      } else if (value === 1) {
                        return '1 usuário cadastrado';
                      } else {
                        return `${value} usuários cadastrados`;
                      }
                    }
                  }
                }
              }
            }}
            data={{
              labels: usersChart.labels,
              datasets: [
                {
                  label: 'Novos Usuários',
                  data: usersChart.values,
                  backgroundColor: 'rgba(147, 51, 234, 0.5)',
                  borderColor: 'rgb(147, 51, 234)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(147, 51, 234, 0.7)',
                  hoverBorderColor: 'rgb(147, 51, 234)',
                  hoverBorderWidth: 2,
                }
              ],
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Usuários Recentes</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-xs text-gray-500">{user.plano}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(user.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Chamadas Recentes</h3>
            <button
              onClick={handleDownloadCDR}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
            >
              <Clock className="h-4 w-4" />
              Exportar CDR
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentCalls.map((call) => (
              <div key={call.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {call.channel} → {call.dst}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        call.disposition === 'ANSWERED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {call.disposition === 'ANSWERED' ? 'Atendida' : 'Não Atendida'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Duração: {formatDuration(call.billsec)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      {formatDateTime(call.start)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}