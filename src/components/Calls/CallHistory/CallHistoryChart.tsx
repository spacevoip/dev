import React from 'react';
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
import { Phone, Clock, CheckCircle, XCircle } from 'lucide-react';
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
  const {
    data,
    loading
  } = useCallHistory({
    currentPage: 1,
    itemsPerPage: 1000,
    sortBy: { column: 'start', direction: 'desc' }
  });

  const stats = useCallStats(data?.data || []);

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
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        type: 'category' as const,
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-violet-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-violet-100 rounded-full p-2">
              <Phone className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Chamadas</p>
              <p className="text-lg font-semibold text-violet-600">{stats.todayStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 rounded-full p-2">
              <Clock className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duração Média</p>
              <p className="text-lg font-semibold text-indigo-600">{formatDuration(stats.averageMinutes * 60)}</p>
            </div>
          </div>
        </div>

        <div className="bg-fuchsia-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-fuchsia-100 rounded-full p-2">
              <CheckCircle className="h-5 w-5 text-fuchsia-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa de Sucesso</p>
              <p className="text-lg font-semibold text-fuchsia-600">{stats.successRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-full p-2">
              <XCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duração Total</p>
              <p className="text-lg font-semibold text-purple-600">{formatDuration(stats.todayStats.totalMinutes * 60)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};
