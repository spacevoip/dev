import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  PhoneCall, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  Phone,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Componente para os cards de estatísticas
const StatCard = ({ icon: Icon, label, value, trend, color }: {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
}) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-2xl font-semibold text-gray-900 mt-1">{value}</h3>
        {trend && (
          <p className={`text-sm mt-2 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend} em relação ao mês anterior
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

// Componente para os cards de clientes recentes
const RecentCustomerCard = ({ name, plan, status, date }: {
  name: string;
  plan: string;
  status: 'active' | 'pending' | 'inactive';
  date: string;
}) => {
  const statusColors = {
    active: 'text-green-600',
    pending: 'text-yellow-600',
    inactive: 'text-red-600'
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-medium">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{plan}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm ${statusColors[status]}`}>
          {status === 'active' ? 'Ativo' : status === 'pending' ? 'Pendente' : 'Inativo'}
        </p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
};

export const ResellerDashboard = () => {
  const { user } = useAuth();

  // Dados mockados para exemplo
  const stats = [
    {
      icon: Users,
      label: 'Total de Clientes',
      value: '48',
      trend: '+12%',
      color: 'bg-blue-500/20 text-blue-500'
    },
    {
      icon: PhoneCall,
      label: 'Chamadas Hoje',
      value: '1,284',
      trend: '+8%',
      color: 'bg-green-500/20 text-green-500'
    },
    {
      icon: DollarSign,
      label: 'Faturamento Mensal',
      value: 'R$ 12.450',
      trend: '+15%',
      color: 'bg-violet-500/20 text-violet-500'
    },
    {
      icon: Activity,
      label: 'Taxa de Conversão',
      value: '68%',
      trend: '+5%',
      color: 'bg-orange-500/20 text-orange-500'
    }
  ];

  const quickStats = [
    { icon: TrendingUp, label: 'Crescimento', value: '+22%' },
    { icon: Clock, label: 'Tempo Médio', value: '2.5m' },
    { icon: Phone, label: 'Ramais Ativos', value: '156' },
    { icon: CheckCircle, label: 'SLA', value: '99.9%' }
  ];

  const recentCustomers = [
    { name: 'Empresa ABC', plan: 'Plano Business', status: 'active' as const, date: '2 horas atrás' },
    { name: 'Tech Solutions', plan: 'Plano Enterprise', status: 'pending' as const, date: '5 horas atrás' },
    { name: 'Startup XYZ', plan: 'Plano Basic', status: 'active' as const, date: '1 dia atrás' },
    { name: 'Consultoria 123', plan: 'Plano Pro', status: 'inactive' as const, date: '2 dias atrás' }
  ];

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Aqui está o resumo do seu negócio hoje</p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-2">
              <stat.icon size={20} className="text-violet-600" />
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <p className="text-xl font-semibold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Clientes Recentes */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Clientes Recentes</h2>
          <Link
            to="/reseller/customers"
            className="text-violet-600 hover:text-violet-700 text-sm font-medium"
          >
            Ver todos
          </Link>
        </div>
        <div className="space-y-4">
          {recentCustomers.map((customer, index) => (
            <RecentCustomerCard key={index} {...customer} />
          ))}
        </div>
      </div>
    </div>
  );
};
