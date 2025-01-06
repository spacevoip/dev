import { useAuth } from '../contexts/AuthContext';
import { useUserDataQuery } from './queries/useUserDataQuery';

export interface UserData {
  name: string;
  email: string;
  plano?: string;
  created_at: string;
  accountid: string;
  status: string;
  limite: number;
}

export function useUserData() {
  const { user } = useAuth();
  const { data, isLoading } = useUserDataQuery(user?.accountid);

  // Garantir que os dados estão sendo carregados corretamente
  console.log('useUserData hook - Auth user:', user);
  console.log('useUserData hook - User data:', data);

  return {
    userData: data,
    loading: isLoading
  };
}
