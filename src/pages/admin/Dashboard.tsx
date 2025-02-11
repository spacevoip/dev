import React, { useState, useCallback, memo } from 'react';
import { Users, Phone, Clock, DollarSign, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { ActiveCallsChart } from '@/components/Admin/Calls/ActiveCallsChart';
import { useDashboardData } from '@/hooks/useDashboardData';
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
import { Skeleton } from '@/components/ui/skeleton';

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

// Componente de estatística memoizado
const StatCard = memo(({ stat }: { stat: any }) => {
  const Icon = stat.icon;
  return (
    <div className="relative bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
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
});

// Componente de usuário recente memoizado
const RecentUserCard = memo(({ user, formatDateTime }: { user: any; formatDateTime: (date: string) => string }) => (
  <div className="p-6 hover:bg-gray-50 transition-colors">
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
));

// Componente de chamada recente memoizado
const RecentCallCard = memo(({ call, formatDateTime, formatDuration }: { call: any; formatDateTime: (date: string) => string; formatDuration: (seconds: number) => string }) => (
  <div className="p-6 hover:bg-gray-50 transition-colors">
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
            {formatDuration(call.billsec)}
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {formatDateTime(call.start)}
      </div>
    </div>
  </div>
));

// Componente de loading
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-[400px] rounded-xl" />
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  </div>
);

export function AdminDashboard() {
  const {
    metrics,
    recentUsers,
    recentCalls,
    usersChart,
    isLoading,
    error,
    lastUpdate,
    refreshData
  } = useDashboardData();

  const [refreshInterval, setRefreshInterval] = useState<number>(30000);

  const formatDateTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

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
      label: 'Quantidade CDR',
      value: metrics.totalCDR.toString(),
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
    maintainAspectRatio: false,
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
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        }
      }
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 min-h-[400px]">
          <ActiveCallsChart />
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novos Usuários por Dia</h3>
          <div className="h-[340px]">
            <Line
              options={chartOptions}
              data={{
                labels: usersChart.labels,
                datasets: [
                  {
                    label: 'Novos Usuários',
                    data: usersChart.values,
                    backgroundColor: 'rgba(147, 51, 234, 0.5)',
                    borderColor: 'rgb(147, 51, 234)',
                    borderWidth: 1,
                    tension: 0.3,
                  }
                ],
              }}
            />
          </div>
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
              <RecentUserCard
                key={user.id}
                user={user}
                formatDateTime={formatDateTime}
              />
            ))}
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Chamadas Recentes</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentCalls.map((call) => (
              <RecentCallCard
                key={call.id}
                call={call}
                formatDateTime={formatDateTime}
                formatDuration={formatDuration}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}