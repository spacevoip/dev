import React from 'react';
import { AlertCircle, UserPlus, CreditCard, Settings } from 'lucide-react';

interface Activity {
  id: string;
  type: 'alert' | 'user' | 'credit' | 'system';
  message: string;
  timestamp: Date;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'alert',
    message: 'Instance A reached 90% of extension limit',
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: '2',
    type: 'user',
    message: 'New instance created for Company C',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    type: 'credit',
    message: 'Company B added R$ 500,00 credits',
    timestamp: new Date(Date.now() - 7200000),
  },
];

export const RecentActivity = () => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'user':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'credit':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-gray-500">
                {activity.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};