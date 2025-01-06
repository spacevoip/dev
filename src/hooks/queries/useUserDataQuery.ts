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
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('accountid', accountId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export function useUserDataQuery(accountId: string | undefined) {
  return useQuery({
    queryKey: ['userData', accountId],
    queryFn: () => fetchUserData(accountId!),
    enabled: !!accountId,
  });
}
