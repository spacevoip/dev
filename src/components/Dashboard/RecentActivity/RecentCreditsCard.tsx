import React, { useState } from 'react';
import { CreditCard, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface CreditRecharge {
  id: string;
  amount: number;
  timestamp: Date;
}

const recentRecharges: CreditRecharge[] = [
  {
    id: '1',
    amount: 50,
    timestamp: new Date(Date.now() - 900000),
  },
  {
    id: '2',
    amount: 100,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    amount: 75,
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: '4',
    amount: 200,
    timestamp: new Date(Date.now() - 10800000),
  },
  {
    id: '5',
    amount: 150,
    timestamp: new Date(Date.now() - 14400000),
  },
];

export const RecentCreditsCard: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const displayRecharges = expanded ? recentRecharges : recentRecharges.slice(0, 3);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Recargas Recentes</h3>
      <div className="space-y-4">
        {displayRecharges.map((recharge) => (
          <div key={recharge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-green-600">
                  +{formatCurrency(recharge.amount)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {new Date(recharge.timestamp).toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {recentRecharges.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ver Menos
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Ver Mais
            </>
          )}
        </button>
      )}
    </div>
  );
};