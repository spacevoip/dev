import React from 'react';
import { ThumbsUp, AlertCircle, Clock } from 'lucide-react';

export const QualityStatsCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center mb-2">
            <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium">Satisfaction</span>
          </div>
          <p className="text-2xl font-bold text-green-600">94%</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-sm font-medium">Dropped</span>
          </div>
          <p className="text-2xl font-bold text-red-600">3.2%</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium">Avg. Wait</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">45s</p>
        </div>
      </div>
    </div>
  );
};