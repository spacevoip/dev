import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generateAccountId } from '../utils/accountIdGenerator';

export const useAccountId = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateNewAccountId = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Busca o último accountid usado
      const { data, error } = await supabase
        .from('users')
        .select('accountid')
        .order('accountid', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      // Gera o próximo accountid
      const newAccountId = generateAccountId(data?.accountid);

      return newAccountId;
    } catch (err) {
      console.error('Erro ao gerar accountid:', err);
      setError('Erro ao gerar novo accountid');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateNewAccountId,
    loading,
    error
  };
};
