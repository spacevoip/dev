import React, { useState, useEffect } from 'react';
import { StatsGrid } from '../components/Dashboard/Stats/StatsGrid';
import { RecentCallsCard } from '../components/Dashboard/RecentActivity/RecentCallsCard';
import { ExtensionsCard } from '../components/Dashboard/RecentActivity/ExtensionsCard';
import { RealtimeCallsChart } from '../components/Dashboard/RealtimeCallsChart';
import { PlanInfoCard } from '../components/Dashboard/RecentActivity/PlanInfoCard';

export const Dashboard = () => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto">
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

        <div className="bg-white rounded-3xl p-6">
          <PlanInfoCard />
        </div>
      </div>
    </div>
  );
};