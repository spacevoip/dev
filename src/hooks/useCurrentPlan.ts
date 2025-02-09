import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCurrentUser } from './useCurrentUser';

interface UserPlan {
  plano: string; // ID do plano no banco
}

export const useCurrentPlan = () => {
  const { currentUser } = useCurrentUser();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        setLoading(true);
        if (!currentUser?.id) {
          setCurrentPlan(null);
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('plano')
          .eq('id', currentUser.id)
          .single();

        console.log('Plano do usuário:', data);

        if (error) {
          console.error('Erro ao buscar plano do usuário:', error);
          return;
        }

        if (data) {
          setCurrentPlan(data.plano);
        }
      } catch (err) {
        console.error('Erro ao buscar plano do usuário:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();

    // Inscreve-se nas mudanças da tabela users
    const subscription = supabase
      .channel('users_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${currentUser?.id}`
        }, 
        (payload) => {
          console.log('Mudança detectada no usuário:', payload);
          fetchUserPlan();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser?.id]);

  return { currentPlan, loading };
};
