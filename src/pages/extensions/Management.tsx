import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useQueries } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, PhoneCall, PhoneOff, Activity, Calendar, Clock, Search, Filter } from 'lucide-react';
import { ExtensionMobileCard } from '../../components/Extensions/ExtensionMobileCard';
import { ExtensionSkeleton } from '../../components/Extensions/ExtensionSkeleton';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface ExtensionStats {
  extension: string;
  agentName: string;
  totalCalls: number;
  answeredCalls: number;
  noAnswerCalls: number;
  successRate: number;
  outboundCalls: number;
  outboundComparison: number;
  averageDuration: number;
  performanceComparison: number;
  sipStatus: string;
  panelStatus: string;
}

export const ExtensionsManagement = () => {
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 7),
    endDate: new Date()
  });

  // Buscar dados dos ramais
  const { data: extensions, isLoading: isLoadingExtensions } = useQuery({
    queryKey: ['extensions', user?.accountid],
    queryFn: async () => {
      if (!user?.accountid) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('extensions')
        .select('numero, nome, snystatus, stagente')
        .eq('accountid', user.accountid);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.accountid
  });

  // Hook para status do SIP
  const extensionQueries = useQueries({
    queries: extensions?.map(ext => ({
      queryKey: ['extensionStatus', ext.numero],
      queryFn: async () => {
        if (!ext.numero) return { status: 'unknown' };

        try {
          const apiUrl = `https://intermed.appinovavoip.com:3000/ramais?ramal=${ext.numero}`;
          
          const response = await fetch(apiUrl, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'x-api-key': '191e8a1e-d313-4e12-b608-d1a759b1a106'
            }
          });

          if (!response.ok) return { status: 'unknown' };

          const data = await response.json();
          
          if (!Array.isArray(data) || data.length === 0) {
            return { status: 'unknown' };
          }

          const status = data[0];
          return {
            status: status.in_call ? 'em chamada' : status.status === 'online' ? 'online (livre)' : status.status
          };

        } catch (error) {
          console.error('Erro ao buscar status do ramal:', error);
          return { status: 'unknown' };
        }
      },
      enabled: !!ext.numero,
      refetchInterval: 5000
    })) || []
  });

  // Query para buscar estatísticas dos ramais
  const { data: stats = [], isLoading } = useQuery<ExtensionStats[]>({
    queryKey: ['extensionStats', user?.accountid, dateRange],
    queryFn: async () => {
      if (!user?.accountid) throw new Error('Usuário não autenticado');

      const { data: calls, error } = await supabase
        .from('cdr2')
        .select('*')
        .eq('accountcode', user.accountid)
        .gte('calldate', startOfDay(dateRange.startDate).toISOString())
        .lte('calldate', endOfDay(dateRange.endDate).toISOString());

      if (error) {
        console.error('Erro ao buscar dados:', error);
        throw error;
      }

      const statsMap = new Map<string, ExtensionStats>();

      calls?.forEach(call => {
        const match = call.channel?.match(/PJSIP\/(\d+)-/);
        if (!match) return;

        const extension = match[1];
        
        // Encontrar o nome do agente para este ramal
        const extensionData = extensions?.find(ext => ext.numero === extension);
        
        // Função para formatar o status do painel
        const formatPanelStatus = (status: string | null | undefined) => {
          if (!status) return 'Indisponível';
          if (status === 'available') return 'Disponível';
          return status;
        };

        // Função para formatar o status do SIP
        const formatSipStatus = (status: string | null | undefined) => {
          if (!status) return 'Offline';
          switch (status.toLowerCase()) {
            case 'online':
              return 'Online (Livre)';
            case 'offline':
              return 'Offline';
            case 'ringing':
              return 'Em Chamada';
            case 'talking':
              return 'Falando';
            default:
              return status;
          }
        };
        
        const current = statsMap.get(extension) || {
          extension,
          agentName: extensionData?.nome || 'Ramal Já Excluído',
          totalCalls: 0,
          answeredCalls: 0,
          noAnswerCalls: 0,
          successRate: 0,
          outboundCalls: 0,
          outboundComparison: 0,
          averageDuration: 0,
          performanceComparison: 0,
          sipStatus: formatSipStatus(extensionData?.snystatus),
          panelStatus: formatPanelStatus(extensionData?.stagente)
        };

        // Total de chamadas
        current.totalCalls++;
        
        // Contagem por disposition
        if (call.disposition === 'ANSWERED') {
          current.answeredCalls++;
        } else if (call.disposition === 'NO ANSWER') {
          current.noAnswerCalls++;
        }
        
        // Taxa de sucesso: ANSWERED / TOTAL
        current.successRate = current.totalCalls > 0 
          ? (current.answeredCalls / current.totalCalls) * 100 
          : 0;

        // Chamadas discadas (quando o ramal está no channel após PJSIP/)
        if (call.channel?.startsWith('PJSIP/' + extension)) {
          current.outboundCalls++;
        }
        
        // Duração média
        const duration = call.duration || 0;
        current.averageDuration = ((current.averageDuration * (current.totalCalls - 1)) + duration) / current.totalCalls;
        
        statsMap.set(extension, current);
      });

      const statsArray = Array.from(statsMap.values());
      const totalAnsweredCalls = statsArray.reduce((acc, curr) => acc + curr.answeredCalls, 0);
      const totalOutboundCalls = statsArray.reduce((acc, curr) => acc + curr.outboundCalls, 0);
      
      return statsArray.map(stat => ({
        ...stat,
        performanceComparison: totalAnsweredCalls > 0 
          ? (stat.answeredCalls / totalAnsweredCalls) * 100 
          : 0,
        outboundComparison: totalOutboundCalls > 0
          ? (stat.outboundCalls / totalOutboundCalls) * 100
          : 0
      }));
    },
    enabled: !!user?.accountid && !!extensions
  });

  // Funções auxiliares
  const formatDuration = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`;
  }, []);

  // Filtrar e ordenar dados
  const filteredStats = useMemo(() => {
    if (!stats) return [];
    return stats
      .filter(stat => {
        const matchesSearch = searchTerm === '' ||
          stat.extension.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stat.agentName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' ||
          (filterStatus === 'online' && stat.sipStatus === 'Online (Livre)') ||
          (filterStatus === 'offline' && stat.sipStatus === 'Offline') ||
          (filterStatus === 'busy' && ['Em Chamada', 'Falando'].includes(stat.sipStatus));
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.totalCalls - a.totalCalls);
  }, [stats, searchTerm, filterStatus]);

  if (!user?.accountid) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Não autorizado</h2>
          <p className="mt-2 text-gray-600">Faça login para acessar o gerenciamento de ramais.</p>
        </div>
      </div>
    );
  }

  if (isLoadingExtensions) {
    return <ExtensionSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Cabeçalho com Título, Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Gerenciamento de Ramais</h1>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Busca */}
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Buscar ramal ou agente..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-violet-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3">
            <select 
              className="form-select rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="busy">Em chamada</option>
            </select>

            <select 
              className="form-select rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500"
              onChange={(e) => {
                const days = parseInt(e.target.value);
                setDateRange({
                  startDate: subDays(new Date(), days),
                  endDate: new Date()
                });
              }}
            >
              <option value="7">Últimos 7 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Phone className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Chamadas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.reduce((acc, curr) => acc + curr.totalCalls, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <PhoneCall className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Chamadas Atendidas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.reduce((acc, curr) => acc + curr.answeredCalls, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Taxa de Atendimento</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(
                  (stats?.reduce((acc, curr) => acc + curr.answeredCalls, 0) /
                  (stats?.reduce((acc, curr) => acc + curr.totalCalls, 0) || 1)) * 100
                )}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Duração Média</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-semibold text-gray-900">
                  {formatDuration(Math.round(
                    stats?.reduce((acc, curr) => acc + curr.averageDuration, 0) / 
                    (stats?.length || 1)
                  ))}
                </p>
                <span className="text-sm text-gray-500">minutos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Desempenho */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Desempenho por Ramal</h3>
        <div className="h-[50vh] min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredStats}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: isMobile ? 60 : 5,
              }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="extension" 
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 100 : 60}
              />
              <YAxis />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 max-w-sm">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">Ramal {data.extension}</p>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm ${data.agentName === 'Ramal Já Excluído' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              {data.agentName}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              data.panelStatus === 'Disponível' ? 'bg-green-100 text-green-800' :
                              data.panelStatus === 'Pausa' ? 'bg-yellow-100 text-yellow-800' :
                              data.panelStatus === 'Em Atendimento' ? 'bg-blue-100 text-blue-800' :
                              data.panelStatus === 'Indisponível' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {data.panelStatus}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600">Chamadas Atendidas: {data.answeredCalls}</p>
                          <span className={`text-xs ${data.performanceComparison > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                            ({Math.round(data.performanceComparison)}% do total)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Taxa de Atendimento: {Math.round(data.successRate)}%</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600">Total de Chamadas Discadas: {data.outboundCalls}</p>
                          <span className={`text-xs ${data.outboundComparison > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                            ({Math.round(data.outboundComparison)}% do total)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Duração Média: {formatDuration(Math.round(data.averageDuration))}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="totalCalls" fill="#8B5CF6">
                {filteredStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#8B5CF6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lista de Ramais (Tabela/Cards) */}
      {isMobile ? (
        <div className="space-y-4">
          {filteredStats.map((stat) => (
            <ExtensionMobileCard
              key={stat.extension}
              stat={stat}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ramal
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SIP
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PAINEL
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chamadas Atendidas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Atendimento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total de Chamadas Discadas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração Média
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStats.map((stat, index) => (
                  <tr key={stat.extension} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {stat.extension}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`text-sm ${stat.agentName === 'Ramal Já Excluído' ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {stat.agentName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`text-sm px-2 py-1 rounded-full ${
                          stat.sipStatus === 'Online (Livre)' ? 'bg-green-100 text-green-800' :
                          stat.sipStatus === 'Offline' ? 'bg-red-100 text-red-800' :
                          stat.sipStatus === 'Em Chamada' ? 'bg-orange-100 text-orange-800' :
                          stat.sipStatus === 'Falando' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {stat.sipStatus}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`text-sm px-2 py-1 rounded-full ${
                          stat.panelStatus === 'Disponível' ? 'bg-green-100 text-green-800' :
                          stat.panelStatus === 'Pausa' ? 'bg-yellow-100 text-yellow-800' :
                          stat.panelStatus === 'Em Atendimento' ? 'bg-blue-100 text-blue-800' :
                          stat.panelStatus === 'Indisponível' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {stat.panelStatus}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{stat.answeredCalls}</span>
                        <span className={`text-xs ${stat.performanceComparison > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                          ({Math.round(stat.performanceComparison)}% do total)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${Math.round(stat.successRate)}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-500">{Math.round(stat.successRate)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{stat.outboundCalls}</span>
                        <span className={`text-xs ${stat.outboundComparison > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                          ({Math.round(stat.outboundComparison)}% do total)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(Math.round(stat.averageDuration))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
