import React, { useEffect, useState } from 'react';
import { Users, Phone, Clock, DollarSign, Settings, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RecentUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
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

export function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeExtensions: 0,
    callDuration: 0,
    revenue: 'R$ 0'
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Total Users
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Active Extensions
        const { count: extensionsCount } = await supabase
          .from('extensions')
          .select('*', { count: 'exact', head: true });

        // Call Records
        const { count: callsCount } = await supabase
          .from('cdr')
          .select('*', { count: 'exact', head: true });

        // Recent Users
        const { data: latestUsers } = await supabase
          .from('users')
          .select('id, name, email, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        // Recent Calls
        const { data: latestCalls } = await supabase
          .from('cdr')
          .select('*')
          .order('start', { ascending: false })
          .limit(5);

        setMetrics({
          totalUsers: usersCount || 0,
          activeExtensions: extensionsCount || 0,
          callDuration: callsCount || 0,
          revenue: 'R$ 0'
        });

        if (latestUsers) setRecentUsers(latestUsers);
        if (latestCalls) {
          const formattedCalls = latestCalls.map(call => ({
            ...call,
            channel: call.channel.split('PJSIP/')[1]?.substring(0, 4) || call.channel
          }));
          setRecentCalls(formattedCalls);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    }

    fetchMetrics();
  }, []);

  const stats = [
    {
      label: 'Usuários Cadastrados',
      value: metrics.totalUsers.toString(),
      icon: Users,
      color: 'from-violet-500 to-fuchsia-500'
    },
    {
      label: 'Quantidade de Ramais Cadastrados',
      value: metrics.activeExtensions.toString(),
      icon: Phone,
      color: 'from-violet-500 to-fuchsia-500'
    },
    {
      label: 'Quantidade de Registro de Chamadas',
      value: metrics.callDuration.toString(),
      icon: Clock,
      color: 'from-violet-500 to-fuchsia-500'
    },
    {
      label: 'Revenue',
      value: metrics.revenue,
      icon: DollarSign,
      color: 'from-violet-500 to-fuchsia-500'
    }
  ];

  function formatDate(dateString: string) {
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
          return `${row.start},${row.channel},${row.dst},${row.billsec}`;
        }).join('\n');

        const header = 'Data,Origem,Destino,Duração\n';
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

  const handleDownloadRecording = async (callId: string) => {
    try {
      // Aqui você pode implementar a lógica para download da gravação específica
      // Por exemplo, buscar a URL da gravação no storage do Supabase
      console.log('Download recording for call:', callId);
    } catch (error) {
      console.error('Error downloading recording:', error);
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
          Última atualização: {new Date().toLocaleTimeString()}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
          </div>
          <div className="space-y-5">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Cadastrado em: {formatDate(user.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chamadas Recentes */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Chamadas Recentes</h3>
            </div>
            <button 
              onClick={() => handleDownloadCDR()}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              <span>Download CDR</span>
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
              <div>Origem</div>
              <div>Destino</div>
              <div>Status</div>
              <div>Duração</div>
              <div className="text-right">Download</div>
            </div>
            {recentCalls.map((call) => (
              <div key={call.id} className="grid grid-cols-5 gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{call.channel}</span>
                </div>
                <div className="text-sm text-gray-900">{call.dst}</div>
                <div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    call.disposition === 'ANSWERED' 
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {call.disposition === 'ANSWERED' ? 'Atendido' : 'Não Atendido'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">{formatDuration(call.billsec)}</div>
                <div className="text-right">
                  {call.recording_url && (
                    <a 
                      href={call.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors duration-200 inline-block"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Status do Sistema</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'API Status', status: 'Operational', color: 'emerald' },
              { label: 'Database', status: 'Operational', color: 'emerald' },
              { label: 'SIP Server', status: 'Operational', color: 'emerald' },
              { label: 'Call Service', status: 'Operational', color: 'emerald' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <span className={`px-3 py-1 text-xs font-medium rounded-full bg-${item.color}-100 text-${item.color}-700`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}