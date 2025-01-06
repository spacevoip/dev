import React from 'react';
import { Users, Phone, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { useActiveCalls } from '../../../hooks/useActiveCalls';
import { useExtensionsCount } from '../../../hooks/useExtensionsCount';
import { useTotalCalls } from '../../../hooks/useTotalCalls';

export const StatsGrid = () => {
  const { data: activeCalls = [] } = useActiveCalls();
  const { currentCount, planLimit, loading: extensionsLoading } = useExtensionsCount();
  const { data: totalCalls = 0, isLoading: totalCallsLoading } = useTotalCalls();

  // Valores fixos por enquanto
  const activeCallsCount = activeCalls.filter(call => call.status === 'Falando').length;
  const receivedCalls = 0;

  const stats = [
    {
      name: 'Ramais Cadastrados',
      value: extensionsLoading ? '...' : `${currentCount}/${planLimit}`,
      icon: Users,
      gradient: 'from-violet-500/20 to-violet-500/5',
      iconGradient: 'from-violet-600 to-violet-400',
      textColor: currentCount >= planLimit ? 'text-red-600' : 'text-violet-600'
    },
    {
      name: 'Chamadas Ativas',
      value: activeCallsCount,
      icon: Phone,
      gradient: 'from-indigo-500/20 to-indigo-500/5',
      iconGradient: 'from-indigo-600 to-indigo-400',
      textColor: 'text-indigo-600'
    },
    {
      name: 'Chamadas Recebidas',
      value: receivedCalls,
      icon: PhoneIncoming,
      gradient: 'from-fuchsia-500/20 to-fuchsia-500/5',
      iconGradient: 'from-fuchsia-600 to-fuchsia-400',
      textColor: 'text-fuchsia-600',
      badge: 'Em Breve'
    },
    {
      name: 'Chamadas Realizadas',
      value: totalCallsLoading ? '...' : totalCalls,
      icon: PhoneOutgoing,
      gradient: 'from-purple-500/20 to-purple-500/5',
      iconGradient: 'from-purple-600 to-purple-400',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
        >
          {/* Círculo decorativo */}
          <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${stat.iconGradient} opacity-10 blur-2xl`} />
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <p className={`text-sm font-medium ${stat.textColor}`}>
                {stat.name}
              </p>
              <p className={`text-3xl font-bold tracking-tight ${stat.textColor}`}>
                {stat.value}
              </p>
              {stat.badge && (
                <span className="mt-1 inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800">
                  {stat.badge}
                </span>
              )}
            </div>
            
            <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.iconGradient}`}>
              <div className="absolute inset-0 rounded-xl bg-white opacity-20" />
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};