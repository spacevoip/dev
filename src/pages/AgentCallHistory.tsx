import React, { useState, useMemo } from 'react';
import { Phone, Search, Download, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { AgentLayout } from '../components/Agent/AgentLayout';
import { useAgentCallHistory } from '../hooks/useAgentCallHistory';
import { useAgent } from '../contexts/AgentContext';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { usePageTitle } from '../hooks/usePageTitle';

// Registrar os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AgentCallHistory() {
  usePageTitle('Histórico de Chamadas');
  const { agent } = useAgent();
  const { calls, loading, error, refetch } = useAgentCallHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 17;

  function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function formatDateTime(dateStr: string) {
    if (!dateStr) return '-';
    return dateStr.replace('T', ' ').split('+')[0];
  }

  // Cálculo de estatísticas
  const stats = React.useMemo(() => {
    const totalCalls = calls.length;
    const answeredCalls = calls.filter(call => call.disposition === 'ANSWERED');
    const totalDuration = calls.reduce((acc, call) => acc + (call.billsec || 0), 0);
    const avgDuration = totalCalls ? Math.floor(totalDuration / totalCalls) : 0;
    const successRate = totalCalls ? (answeredCalls.length / totalCalls) * 100 : 0;

    return {
      totalCalls,
      answeredCalls: answeredCalls.length,
      avgDuration,
      successRate: successRate.toFixed(1)
    };
  }, [calls]);

  const handleDownloadCSV = () => {
    try {
      if (!calls.length) {
        toast.error('Não há chamadas para exportar');
        return;
      }

      const csv = calls.map(row => {
        const channel = row.channel?.split('PJSIP/')[1]?.substring(0, 4) || row.channel || '';
        return `${row.start},${channel},${row.dst},${row.billsec},${row.disposition}`;
      }).join('\n');

      const header = 'Data,Origem,Destino,Duração,Status\n';
      const blob = new Blob([header + csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `minhas_chamadas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Arquivo CSV baixado com sucesso!');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Erro ao baixar CSV');
    }
  };

  const filteredCalls = calls.filter(call => 
    call.dst.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalItems = filteredCalls.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCalls.slice(startIndex, endIndex);

  // Dados do gráfico
  const chartData = useMemo(() => {
    if (!calls || !Array.isArray(calls)) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Agrupa chamadas por hora
    const hourlyData = calls.reduce((acc, call) => {
      const hour = new Date(call.start).getHours();
      if (!acc[hour]) {
        acc[hour] = { total: 0, answered: 0, missed: 0 };
      }
      acc[hour].total += 1;
      if (call.disposition === 'ANSWERED') {
        acc[hour].answered += 1;
      } else {
        acc[hour].missed += 1;
      }
      return acc;
    }, {} as Record<number, { total: number; answered: number; missed: number }>);

    // Cria array com 24 horas
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const totalData = hours.map(hour => hourlyData[hour]?.total || 0);
    const answeredData = hours.map(hour => hourlyData[hour]?.answered || 0);
    const missedData = hours.map(hour => hourlyData[hour]?.missed || 0);
    
    return {
      labels: hours.map(hour => `${String(hour).padStart(2, '0')}:00`),
      datasets: [
        {
          label: 'Total de Chamadas',
          data: totalData,
          borderColor: 'rgb(124, 58, 237)',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4,
          order: 3,
        },
        {
          label: 'Atendidas',
          data: answeredData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderDash: [5, 5],
          tension: 0.4,
          order: 1,
        },
        {
          label: 'Não Atendidas',
          data: missedData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [5, 5],
          tension: 0.4,
          order: 2,
        }
      ]
    };
  }, [calls]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: 'bold',
        },
        callbacks: {
          title: (tooltipItems: any[]) => {
            return `Horário: ${tooltipItems[0].label}`;
          },
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' chamadas';
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          stepSize: 1,
          padding: 10,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          }
        },
        title: {
          display: true,
          text: 'Número de Chamadas',
          font: {
            size: 13,
            family: "'Inter', sans-serif",
          },
          padding: 10
        }
      },
      x: {
        type: 'category' as const,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          maxRotation: 45,
          minRotation: 45,
        },
        title: {
          display: true,
          text: 'Hora do Dia',
          font: {
            size: 13,
            family: "'Inter', sans-serif",
          },
          padding: 10
        }
      },
    },
  };

  return (
    <AgentLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Minhas Chamadas</h2>
            <p className="text-gray-500">Histórico das suas chamadas realizadas</p>
          </div>
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download className="h-5 w-5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <Phone className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Chamadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCalls}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Chamadas Atendidas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.answeredCalls}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Duração Média</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.avgDuration)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <XCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Distribuição de Chamadas</h3>
                <p className="text-sm text-gray-500">Visualização detalhada das chamadas por hora</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  <span className="text-sm text-gray-600">Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Atendidas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Não Atendidas</span>
                </div>
              </div>
            </div>

            <div className="h-[400px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
                    <p className="text-sm text-gray-500">Carregando dados...</p>
                  </div>
                </div>
              ) : calls.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Nenhuma chamada registrada no período</p>
                </div>
              ) : (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-sm text-gray-500">
          Exibindo {Math.min(endIndex, totalItems)} registros de {totalItems}
        </div>

        {/* Calls Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Carregando chamadas...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-red-500">
                      Erro ao carregar chamadas: {error}
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma chamada encontrada
                    </td>
                  </tr>
                ) : (
                  currentItems.map((call) => (
                    <tr key={call.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(call.start)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {call.dst}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(call.billsec)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          call.disposition === 'ANSWERED' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {call.disposition === 'ANSWERED' ? 'Atendida' : 'Não Atendida'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}
