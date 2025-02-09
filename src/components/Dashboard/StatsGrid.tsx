import React from 'react';
import { Users, Phone, Clock, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface StatsData {
  totalUsers: number;
  activeCalls: number;
  callDuration: number;
  balance: number;
}

export const StatsGrid: React.FC = () => {
  const { data: stats } = useQuery<StatsData>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/stats');
      return response.data;
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });

  const cards = [
    {
      title: 'Total de Usuários',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-600 to-blue-400'
    },
    {
      title: 'Chamadas Ativas',
      value: stats?.activeCalls || 0,
      icon: Phone,
      color: 'from-green-600 to-green-400'
    },
    {
      title: 'Duração Total',
      value: `${Math.floor((stats?.callDuration || 0) / 60)}min`,
      icon: Clock,
      color: 'from-purple-600 to-purple-400'
    },
    {
      title: 'Saldo Atual',
      value: `R$ ${(stats?.balance || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-orange-600 to-orange-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="relative group overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {/* Gradiente de fundo animado */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            <card.icon className="h-5 w-5 text-gray-400" />
          </div>

          <div className="relative z-10">
            <p className="text-2xl font-semibold text-gray-900">
              {typeof card.value === 'number' ? card.value.toLocaleString('pt-BR') : card.value}
            </p>
          </div>

          {/* Indicador de atualização */}
          <div className="absolute bottom-2 right-2 w-1 h-1">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <div className="relative inline-flex rounded-full h-1 w-1 bg-sky-500" />
          </div>
        </div>
      ))}
    </div>
  );
};
