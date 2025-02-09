import { useState, useEffect } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { supabase } from '../lib/supabase';

interface ExtensionLimitInfo {
  currentCount: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

export const useExtensionLimit = (): ExtensionLimitInfo => {
  const [data, setData] = useState<ExtensionLimitInfo>({
    currentCount: 0,
    limit: 0,
    loading: true,
    error: null,
  });
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    const fetchLimitInfo = async () => {
      if (!currentUser?.accountid) return;

      try {
        // Busca o limite na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('limite')
          .eq('accountid', currentUser.accountid)
          .single();

        if (userError) throw userError;

        // Conta quantos ramais o usuário tem
        const { count, error: countError } = await supabase
          .from('extensions')
          .select('*', { count: 'exact', head: true })
          .eq('accountid', currentUser.accountid);

        if (countError) throw countError;

        setData({
          currentCount: count || 0,
          limit: userData.limite || 0,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching extension limit info:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar informações de limite de ramais',
        }));
      }
    };

    fetchLimitInfo();
  }, [currentUser?.accountid]);

  return data;
};
