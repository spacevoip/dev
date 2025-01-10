import React from 'react';
import { Users, PhoneCall, DollarSign, Activity } from 'lucide-react';

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  totalExtensions: number;
  monthlyRevenue: number;
}

interface CustomerStatsProps {
  stats: CustomerStats;
}

export const CustomerStats: React.FC<CustomerStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalCustomers,
      change: '+12%',
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Clientes Ativos',
      value: stats.activeCustomers,
      change: '+8%',
      icon: Activity,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Total de Ramais',
      value: stats.totalExtensions,
      change: '+15%',
      icon: PhoneCall,
      color: 'bg-violet-100 text-violet-600'
    },
    {
      title: 'Receita Mensal',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(stats.monthlyRevenue),
      change: '+20%',
      icon: DollarSign,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</h3>
                <p className="text-sm mt-2 text-green-600">{stat.change} este mês</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
