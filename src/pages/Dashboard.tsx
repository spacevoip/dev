import React, { useState, useEffect } from 'react';
import { StatsGrid } from '../components/Dashboard/Stats/StatsGrid';
import { RecentCallsCard } from '../components/Dashboard/RecentActivity/RecentCallsCard';
import { ExtensionsCard } from '../components/Dashboard/RecentActivity/ExtensionsCard';
import { RealtimeCallsChart } from '../components/Dashboard/RealtimeCallsChart';

export const Dashboard = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-end items-center">
        <div className="text-sm text-gray-600">
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        </div>
      </div>

      <StatsGrid key={`stats-${key}`} />
      
      <RealtimeCallsChart />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentCallsCard key={`calls-${key}`} />
        <ExtensionsCard key={`extensions-${key}`} />
      </div>
    </div>
  );
};