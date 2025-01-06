import React from 'react';
import { UserProfile } from '../components/Settings/UserProfile';
import { useUserDataQuery } from '../hooks/queries/useUserDataQuery';
import { usePlanQuery } from '../hooks/queries/usePlanQuery';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const { data: userData, isLoading: isLoadingUser } = useUserDataQuery(user?.accountid);
  const { data: planData, isLoading: isLoadingPlan } = usePlanQuery(userData?.plano);

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Não foi possível carregar os dados do usuário.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <UserProfile userData={userData} planData={planData} />
    </div>
  );
}