import { useState, useEffect } from 'react';
import { Users, AlertTriangle, UserCheck, UserX } from 'lucide-react';
import { AdminUser } from '../../../pages/admin/Users';
import { supabase } from '../../../lib/supabase';

interface UserStatsProps {
  users: AdminUser[];
}

interface Plan {
  id: string;
  nome: string;
  validade: number;
}

export const UserStats = ({ users }: UserStatsProps) => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0
  });

  useEffect(() => {
    const calculateStats = async () => {
      try {
        const { data: plans, error: plansError } = await supabase
          .from('planos')
          .select('*');

        if (plansError) throw plansError;

        // Criar mapa de planos para consulta rápida
        const plansMap = new Map(plans.map(plan => [plan.nome.toLowerCase(), plan.validade]));

        const total = users.length;
        const active = users.filter(user => user.status === 'active').length;
        const inactive = users.filter(user => user.status === 'inactive').length;

        // Calcular usuários vencidos usando apenas a data
        const expired = users.filter(user => {
          if (!user.created_at || !user.plano) return false;

          // Pegar a validade do plano
          const planoNormalizado = user.plano.toLowerCase().trim();
          const validity = plansMap.get(planoNormalizado);
          if (!validity) return false;

          const now = new Date();
          now.setHours(0, 0, 0, 0);

          const createdAt = new Date(user.created_at);
          createdAt.setHours(0, 0, 0, 0);
          
          const expirationDate = new Date(createdAt);
          expirationDate.setDate(createdAt.getDate() + validity);
          expirationDate.setHours(23, 59, 59, 999);

          return now > expirationDate;
        }).length;

        setStats({
          total,
          active,
          inactive,
          expired
        });

      } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
      }
    };

    calculateStats();
  }, [users]);

  const stats_cards = [
    {
      title: 'Total de Usuários',
      value: stats.total,
      icon: Users,
      color: 'blue',
      description: 'Usuários registrados no sistema'
    },
    {
      title: 'Usuários Ativos',
      value: stats.active,
      icon: UserCheck,
      color: 'green',
      description: 'Usuários com status ativo'
    },
    {
      title: 'Usuários Inativos',
      value: stats.inactive,
      icon: UserX,
      color: 'gray',
      description: 'Usuários com status inativo'
    },
    {
      title: 'Planos Vencidos',
      value: stats.expired,
      icon: AlertTriangle,
      color: 'red',
      description: 'Usuários ativos com plano vencido'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats_cards.map((card, index) => {
        const colorClasses = {
          blue: 'bg-blue-50 text-blue-700 ring-blue-700/10',
          green: 'bg-green-50 text-green-700 ring-green-600/10',
          gray: 'bg-gray-50 text-gray-600 ring-gray-500/10',
          red: 'bg-red-50 text-red-700 ring-red-700/10'
        };

        const bgGradient = {
          blue: 'from-blue-400 to-blue-600',
          green: 'from-green-400 to-green-600',
          gray: 'from-gray-400 to-gray-600',
          red: 'from-red-400 to-red-600'
        };

        return (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100"
          >
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-2.5 ${colorClasses[card.color]}`}>
                  <card.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">{card.description}</p>
            </div>
            {/* Decorative gradient bar */}
            <div 
              className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${bgGradient[card.color]}`}
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
};
