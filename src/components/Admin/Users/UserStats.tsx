import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react';
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

export const UserStats: React.FC<UserStatsProps> = ({ users }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsers: 0,
    expiredUsers: 0
  });

  useEffect(() => {
    const calculateStats = async () => {
      try {
        // Buscar os planos
        const { data: plans, error: plansError } = await supabase
          .from('planos')
          .select('*');

        if (plansError) throw plansError;

        // Data atual e data há 30 dias atrás
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        // Contagens básicas
        const totalUsers = users.length;
        const activeUsers = users.filter(user => {
          const status = user.status?.toLowerCase() || '';
          return status === 'active' || status === 'ativo';
        }).length;
        const inactiveUsers = users.filter(user => {
          const status = user.status?.toLowerCase() || '';
          return status === 'inactive' || status === 'inativo' || !status;
        }).length;
        
        // Novos usuários (últimos 30 dias)
        const newUsers = users.filter(user => {
          const createdAt = new Date(user.created_at);
          return createdAt >= thirtyDaysAgo;
        }).length;

        // Usuários com plano vencido
        const expiredUsers = users.filter(user => {
          const status = user.status?.toLowerCase() || '';
          if (status !== 'active' && status !== 'ativo') return false;
          if (!user.created_at || !user.plano) return false;

          // Encontrar o plano do usuário
          const userPlan = plans?.find(p => p.id === user.plano);
          if (!userPlan?.validade) return false;

          // Calcular data de vencimento
          const createdAt = new Date(user.created_at);
          const validityDays = userPlan.validade;
          const expirationDate = new Date(createdAt);
          expirationDate.setDate(createdAt.getDate() + validityDays);

          return now > expirationDate;
        }).length;

        setStats({
          totalUsers,
          activeUsers,
          inactiveUsers,
          newUsers,
          expiredUsers
        });

      } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
      }
    };

    calculateStats();
  }, [users]);

  const StatCard = ({ 
    icon: Icon, 
    value, 
    label, 
    color,
    subtext
  }: { 
    icon: any; 
    value: number; 
    label: string;
    color: string;
    subtext?: string;
  }) => (
    <div className="flex flex-col bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <span className="text-sm text-gray-600">{label}</span>
      {subtext && <span className="text-xs text-gray-500 mt-1">{subtext}</span>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        icon={Users}
        value={stats.totalUsers}
        label="Total de Usuários"
        color="bg-blue-500"
      />
      <StatCard
        icon={UserCheck}
        value={stats.activeUsers}
        label="Usuários Ativos"
        color="bg-green-500"
      />
      <StatCard
        icon={UserX}
        value={stats.inactiveUsers}
        label="Usuários Inativos"
        color="bg-red-500"
      />
      <StatCard
        icon={Clock}
        value={stats.newUsers}
        label="Novos (30 dias)"
        color="bg-violet-500"
      />
      <StatCard
        icon={AlertTriangle}
        value={stats.expiredUsers}
        label="Planos Vencidos"
        color="bg-orange-500"
        subtext="Usuários ativos com plano expirado"
      />
    </div>
  );
};
