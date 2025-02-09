import React, { useEffect, useRef, useState } from 'react';
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
import { Phone, Clock, CheckCircle, XCircle, ChevronDown, Activity } from 'lucide-react';
import { formatDuration } from '../../../utils/formatters';
import { useCallHistory } from '../../../hooks/useCallHistory';
import { useCallStats } from '../../../hooks/useCallStats';

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

export const CallHistoryChart: React.FC = () => {
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(300);

  const {
    data,
    loading
  } = useCallHistory({
    currentPage: 1,
    itemsPerPage: 1000,
    sortBy: { column: 'start', direction: 'desc' }
  });

  const stats = useCallStats(data?.data || []);

  // Ajusta a altura do gráfico baseado no tamanho da tela
  useEffect(() => {
    const updateChartHeight = () => {
      if (chartRef.current) {
        const width = chartRef.current.offsetWidth;
        setChartHeight(width < 640 ? 200 : 300);
      }
    };

    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);
    return () => window.removeEventListener('resize', updateChartHeight);
  }, []);

  const chartData = {
    labels: stats.hourlyStats.labels,
    datasets: [{
      label: 'Chamadas por Hora',
      data: stats.hourlyStats.data,
      fill: true,
      borderColor: 'rgb(124, 58, 237)',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      tension: 0.4,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          display: window.innerWidth > 640, // Esconde os ticks em telas pequenas
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          display: window.innerWidth > 640, // Esconde as linhas de grade em telas pequenas
        },
      },
      x: {
        type: 'category' as const,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: window.innerWidth < 640 ? 6 : 12, // Menos labels em telas pequenas
        }
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header com botão de toggle */}
      <div 
        className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setIsStatsOpen(!isStatsOpen)}
      >
        <h3 className="font-medium text-gray-900">Estatísticas de Hoje</h3>
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isStatsOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Conteúdo colapsável */}
      {isStatsOpen && (
        <>
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Phone className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Chamadas</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.todayStats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Chamadas Atendidas</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.todayStats.answered}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Não Atendidas</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.todayStats.noAnswer}
                  </p>
                  <p className="text-xs text-gray-500">
                    Inclui falhas, ocupadas e não atendidas
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Taxa de Sucesso</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-semibold text-gray-900">
                      {Math.round(stats.successRate)}%
                    </p>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full w-24">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.round(stats.successRate)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Chamadas atendidas / total
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div ref={chartRef} className="p-4" style={{ height: chartHeight }}>
            <Line data={chartData} options={options} />
          </div>
        </>
      )}
    </div>
  );
};
