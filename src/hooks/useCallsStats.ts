// Este arquivo não é mais necessário e pode ser removido

import { useState, useEffect } from 'react';

interface CallsStats {
  activeCalls: number;
  onlineExtensions: number;
  todayCalls: number;
  loading: boolean;
  error: string | null;
}

export const useCallsStats = (accountcode: string) => {
  const [stats, setStats] = useState<CallsStats>({
    activeCalls: 0,
    onlineExtensions: 0,
    todayCalls: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Busca chamadas ativas
        const activeCallsResponse = await fetch('https://api.appinovavoip.com/active-calls');
        const activeCallsData = await activeCallsResponse.json();

        // Filtra chamadas ativas pelo accountcode
        const activeCalls = activeCallsData.active_calls.filter((call: any) => 
          typeof call === 'object' && 
          'Accountcode' in call && 
          call.Accountcode === accountcode
        ).length;

        // Busca ramais usando a rota correta
        const extensionsResponse = await fetch('https://api.appinovavoip.com/extension-status');
        const extensionsData = await extensionsResponse.json();

        // Conta ramais online
        const onlineExtensions = extensionsData.extensions.filter((ext: any) => 
          ext.status.toLowerCase().includes('online')
        ).length;

        // Busca chamadas do dia
        const todayCallsResponse = await fetch('https://api.appinovavoip.com/today-calls');
        const todayCallsData = await todayCallsResponse.json();

        // Atualiza o estado
        setStats({
          activeCalls,
          onlineExtensions,
          todayCalls: todayCallsData.total || 0,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch stats'
        }));
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, [accountcode]);

  return stats;
};
