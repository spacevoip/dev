import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ExtensionsInfo {
  currentCount: number;
  planLimit: number;
  loading: boolean;
  error: string | null;
}

export function useExtensionsCount() {
  const { user } = useAuth();
  const [info, setInfo] = useState<ExtensionsInfo>({
    currentCount: 0,
    planLimit: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      if (!user?.accountid) {
        setInfo(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Busca o plano do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('plano')
          .eq('accountid', user.accountid)
          .single();

        if (userError) throw userError;

        // Busca o limite do plano
        const { data: planData, error: planError } = await supabase
          .from('planos')
          .select('limite')
          .eq('nome', userData.plano)
          .single();

        if (planError) throw planError;

        // Conta quantos ramais o usuário tem usando o accountid
        const { count: extensionsCount, error: extensionsError } = await supabase
          .from('extensions')
          .select('*', { count: 'exact' })
          .eq('accountid', user.accountid);

        if (extensionsError) throw extensionsError;

        setInfo({
          currentCount: extensionsCount || 0,
          planLimit: planData.limite,
          loading: false,
          error: null
        });

      } catch (err) {
        console.error('Erro ao buscar informações dos ramais:', err);
        setInfo(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar informações dos ramais'
        }));
      }
    }

    fetchData();

    // Inscreve para atualizações na tabela extensions usando accountid
    const extensionsSubscription = supabase
      .channel('extensions-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'extensions',
          filter: `accountid=eq.${user?.accountid}`
        }, 
        () => {
          fetchData(); // Atualiza os dados quando houver mudanças
        }
      )
      .subscribe();

    return () => {
      extensionsSubscription.unsubscribe();
    };
  }, [user?.accountid]); // Dependência mudada para accountid

  return info;
}
