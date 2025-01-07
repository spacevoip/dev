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
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          <div className="text-sm text-gray-500">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>
        </div>

        <StatsGrid key={`stats-${key}`} />
        
        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Chamadas em Curso</h2>
          <RealtimeCallsChart />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6">
            <RecentCallsCard key={`calls-${key}`} />
          </div>
          <div className="bg-white rounded-3xl p-6">
            <ExtensionsCard key={`extensions-${key}`} />
          </div>
        </div>
      </div>
    </div>
  );
};