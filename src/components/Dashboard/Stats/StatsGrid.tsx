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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-3xl bg-white/80 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-sm`}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm font-medium text-gray-600`}>
                {stat.name}
              </p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${stat.iconGradient}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <p className={`text-2xl sm:text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
              {stat.badge && (
                <span className="text-xs text-gray-500">
                  {stat.badge}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};