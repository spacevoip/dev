import React from 'react';
import { BarChart, Clock } from 'lucide-react';

export const CallVolumeCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Call Volume</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md">Day</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Week</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Month</button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-3xl font-bold">847</p>
          <p className="text-sm text-gray-600">Total Calls</p>
        </div>
        <div className="flex items-center text-green-600">
          <BarChart className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">+12.5%</span>
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>Avg. Duration: 4m 32s</span>
        </div>
        <span>Peak Hour: 10:00 AM</span>
      </div>
    </div>
  );
};