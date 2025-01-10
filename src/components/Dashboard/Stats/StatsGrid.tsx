import React, { useMemo } from 'react';
import { Users, Phone, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { useActiveCalls } from '../../../hooks/useActiveCalls';
import { useExtensionsCount } from '../../../hooks/useExtensionsCount';
import { useTotalCalls } from '../../../hooks/useTotalCalls';

export const StatsGrid = () => {
  // Configurando os hooks com staleTime apropriado
  const { data: activeCalls = [] } = useActiveCalls({
    select: (data) => data.filter(call => call.status === 'Falando'),
    staleTime: 5000,
  });

  const { currentCount, planLimit, isLoading: extensionsLoading } = useExtensionsCount({
    staleTime: 30000,
  });

  const { data: totalCalls = 0, isLoading: totalCallsLoading } = useTotalCalls({
    staleTime: 30000,
  });

  // Valores calculados uma vez e memorizados
  const activeCallsCount = useMemo(() => 
    activeCalls.length, [activeCalls]
  );

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
      value: 0,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/80 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-sm`}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className={`text-sm font-medium text-gray-600 line-clamp-1`}>
                {stat.name}
              </p>
              <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br ${stat.iconGradient}`}>
                <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.textColor}`}>
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