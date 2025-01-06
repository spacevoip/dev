import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { RechargeForm } from '../components/Recharge/RechargeForm';
import { PaymentQRCode } from '../components/Recharge/PaymentQRCode';
import { formatCurrency } from '../utils/formatters';

export const Recharge = () => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(0);

  const handleRecharge = (amount: number) => {
    setRechargeAmount(amount);
    setShowQRCode(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recharge Credits</h1>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Add Credits</h2>
            <p className="text-sm text-gray-600">Current Balance: {formatCurrency(1250)}</p>
          </div>
        </div>

        <RechargeForm onSubmit={handleRecharge} />
      </div>

      {showQRCode && (
        <PaymentQRCode
          amount={rechargeAmount}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  );
};