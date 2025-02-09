import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useCallerIDBlacklistCheck = (callerid: string) => {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkCallerID = async () => {
      if (!callerid?.trim()) {
        setIsBlocked(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('calleridblack')
          .select('id')
          .eq('callerid', callerid.trim())
          .maybeSingle();

        if (error) {
          console.error('Error checking CallerID:', error);
          return;
        }

        setIsBlocked(!!data);
      } catch (error) {
        console.error('Error checking CallerID:', error);
      }
    };

    // Verifica imediatamente quando o callerid muda
    checkCallerID();

    // Inscreve para mudanças na tabela
    const subscription = supabase
      .channel('calleridblack-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calleridblack',
        },
        () => {
          // Quando houver qualquer mudança na tabela, verifica novamente
          checkCallerID();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [callerid]);

  return { isBlocked };
};
