import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  accountid: string;
  plano: string;
  valido: boolean;
  status: string;
  created_at: string;
}

export const useCurrentUser = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, accountid, name, email, plano, valido, status, created_at')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setCurrentUser(data as CurrentUser);
        }
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        setError('Erro ao carregar dados do usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user?.id]);

  return { currentUser, loading, error };
};
