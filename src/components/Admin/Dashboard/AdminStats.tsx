import React from 'react';
import { Server, Users, PhoneCall, CreditCard } from 'lucide-react';
import { StatCard } from '../../Dashboard/StatCard';

export const AdminStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Instances"
        value="48"
        icon={Server}
        className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
        iconClassName="text-blue-600 bg-blue-200"
      />
      <StatCard
        title="Total Extensions"
        value="1,254"
        icon={Users}
        className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
        iconClassName="text-green-600 bg-green-200"
      />
      <StatCard
        title="Active Calls"
        value="326"
        icon={PhoneCall}
        className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
        iconClassName="text-purple-600 bg-purple-200"
      />
      <StatCard
        title="Total Credits"
        value="R$ 45.280,00"
        icon={CreditCard}
        className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200"
        iconClassName="text-orange-600 bg-orange-200"
      />
    </div>
  );
};