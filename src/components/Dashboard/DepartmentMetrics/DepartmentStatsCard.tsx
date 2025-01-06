import React from 'react';
import { Users } from 'lucide-react';

interface DepartmentStat {
  name: string;
  calls: number;
  agents: number;
  availability: number;
}

const departmentStats: DepartmentStat[] = [
  { name: 'Sales', calls: 245, agents: 8, availability: 85 },
  { name: 'Support', calls: 189, agents: 12, availability: 92 },
  { name: 'Technical', calls: 156, agents: 6, availability: 78 },
];

export const DepartmentStatsCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Department Statistics</h3>
      <div className="space-y-4">
        {departmentStats.map((dept) => (
          <div key={dept.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{dept.name}</p>
                <p className="text-sm text-gray-600">{dept.agents} Agents</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{dept.calls} Calls</p>
              <p className="text-sm text-gray-600">{dept.availability}% Available</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};