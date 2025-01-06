// Este arquivo não é mais necessário e pode ser removido

import { useState, useEffect } from 'react';
import { ActiveCall } from '../types/activeCalls';

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
        const activeCallsResponse = await fetch('http://91.108.125.149:5000/active-calls');
        const activeCallsData = await activeCallsResponse.json();

        // Filtra chamadas ativas pelo accountcode
        const activeCalls = activeCallsData.active_calls.filter((call: any) => 
          typeof call === 'object' && 
          'Accountcode' in call && 
          call.Accountcode === accountcode
        ).length;

        // Busca ramais usando a rota correta
        const extensionsResponse = await fetch('http://91.108.125.149:5000/extension-status');
        const extensionsData = await extensionsResponse.json();
        
        // Filtra ramais online pelo accountcode
        const onlineExtensions = extensionsData.filter((ext: any) =>
          ext.accountcode === accountcode && 
          ext.status === 'Online (Livre)'
        ).length;

        // Busca chamadas do dia da tabela CDR
        const todayCallsResponse = await fetch(`http://91.108.125.149:5000/cdr/today/${accountcode}`);
        const todayCallsData = await todayCallsResponse.json();
        
        // O backend já retorna a contagem filtrada
        const todayCalls = todayCallsData.count || 0;

        setStats({
          activeCalls,
          onlineExtensions,
          todayCalls,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar estatísticas'
        }));
      }
    };

    // Busca inicial
    fetchStats();

    // Atualiza a cada 5 segundos
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, [accountcode]);

  return stats;
};
