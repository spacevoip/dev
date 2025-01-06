import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export interface UserData {
  name: string;
  email: string;
  plano?: string;
  created_at: string;
  accountid: string;
  status: string;
  role?: 'admin' | 'cliente' | 'user';
}

async function fetchUserData(accountId: string): Promise<UserData | null> {
  console.log('Fetching user data with accountId:', accountId);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('accountid', accountId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }

  console.log('User data fetched:', data);
  return data;
}

export function useUserDataQuery(accountId: string | undefined) {
  console.log('useUserDataQuery called with accountId:', accountId);
  
  return useQuery({
    queryKey: ['userData', accountId],
    queryFn: () => fetchUserData(accountId!),
    enabled: !!accountId,
  });
}
