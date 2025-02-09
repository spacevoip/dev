import React from 'react';
import { Activity, Server, Database, Globe } from 'lucide-react';

interface HealthStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  latency: number;
  icon: typeof Activity;
}

const healthChecks: HealthStatus[] = [
  { name: 'API Server', status: 'healthy', latency: 45, icon: Server },
  { name: 'Database', status: 'healthy', latency: 12, icon: Database },
  { name: 'CDN', status: 'warning', latency: 150, icon: Globe },
];

export const SystemHealth = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">System Health</h2>
      <div className="space-y-4">
        {healthChecks.map((check) => {
          const Icon = check.icon;
          const statusColors = {
            healthy: 'text-green-600 bg-green-100',
            warning: 'text-yellow-600 bg-yellow-100',
            critical: 'text-red-600 bg-red-100',
          };

          return (
            <div key={check.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${statusColors[check.status]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-gray-500">{check.latency}ms</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[check.status]}`}>
                {check.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};