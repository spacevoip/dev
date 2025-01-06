import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { RefreshButton } from '../../../components/Common/RefreshButton';
import { formatCurrency } from '../../../utils/formatters';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserData } from '../../../hooks/useUserData';

export const CreditBalance: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();
  const { userData } = useUserData();
  const [balance, setBalance] = useState(1250);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    setBalance(1250);
    setLastUpdate(new Date());
  };

  // Se o usuário tem um plano ativo, mostra o nome do plano em vez do saldo
  const displayValue = userData?.plano ? userData.plano : formatCurrency(balance);
  const displayLabel = userData?.plano ? 'Plano Atual' : 'Saldo Disponível';

  if (isCollapsed) {
    return (
      <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl group relative">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-violet-200" />
          <RefreshButton onRefresh={handleRefresh} size="sm" />
        </div>
        <div className="absolute left-full bottom-0 ml-2 px-3 py-2 bg-indigo-900 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          <p className="text-sm text-indigo-200">{displayLabel}</p>
          <p className="text-lg font-semibold text-white">{displayValue}</p>
          <p className="text-xs text-indigo-300 mt-1">
            Atualizado: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-indigo-200">{displayLabel}</p>
        <RefreshButton onRefresh={handleRefresh} />
      </div>
      <p className="text-lg font-semibold text-white">{displayValue}</p>
      <p className="text-xs text-indigo-300 mt-1">
        Atualizado: {lastUpdate.toLocaleTimeString()}
      </p>
    </div>
  );
};