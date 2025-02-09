import React from 'react';
import { useUserDataQuery } from '../hooks/queries/useUserDataQuery';
import { usePlanQuery } from '../hooks/queries/usePlanQuery';
import { useAuth } from '../contexts/AuthContext';
import { SettingsTabs } from '../components/Settings/SettingsTabs';
import { ProfileCard } from '../components/Settings/ProfileCard';
import { PlanCard } from '../components/Settings/PlanCard';
import { SecurityCard } from '../components/Settings/SecurityCard';
import { SettingsSkeleton } from '../components/Settings/SettingsSkeleton';
import { useSearchParams } from 'react-router-dom';

export function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';
  
  const { user } = useAuth();
  const { data: userData, isLoading: isLoadingUser } = useUserDataQuery(user?.accountid);
  const { data: planData, isLoading: isLoadingPlan } = usePlanQuery(userData?.plano);

  if (isLoadingUser || isLoadingPlan) {
    return <SettingsSkeleton />;
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Não foi possível carregar os dados do usuário.</p>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie suas preferências e informações da conta
        </p>
      </div>

      {/* Navigation Tabs */}
      <SettingsTabs currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Content */}
      <div className="mt-6 space-y-6">
        {currentTab === 'profile' && (
          <>
            <ProfileCard userData={userData} planData={planData} />
            <PlanCard userData={userData} planData={planData} />
          </>
        )}
        {currentTab === 'plan' && (
          <PlanCard userData={userData} planData={planData} />
        )}
        {currentTab === 'security' && (
          <SecurityCard />
        )}
        {currentTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold">Notificações</h2>
            <p className="text-sm text-gray-500">Em breve</p>
          </div>
        )}
        {currentTab === 'integrations' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold">Integrações</h2>
            <p className="text-sm text-gray-500">Em breve</p>
          </div>
        )}
      </div>
    </div>
  );
}
