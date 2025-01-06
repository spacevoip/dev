import { useCurrentUser } from './useCurrentUser';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

// Tipo genérico para os dados retornados
export interface QueryResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSupabaseQuery = <T extends { accountid?: string }>(
  table: string,
  options: {
    select?: string;
    additionalFilters?: (query: any) => any;
    enabled?: boolean;
  } = {}
): QueryResult<T> => {
  const { currentUser } = useCurrentUser();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!currentUser?.accountid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(table)
        .select(options.select || '*')
        .eq('accountid', currentUser.accountid);

      // Aplica filtros adicionais se fornecidos
      if (options.additionalFilters) {
        query = options.additionalFilters(query);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData(result as T[]);
    } catch (err) {
      setError(`Erro ao carregar dados de ${table}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [currentUser?.accountid, options.enabled]);

  return { data, loading, error, refetch: fetchData };
};

// Hook específico para inserção de dados
export const useSupabaseInsert = <T extends object>(table: string) => {
  const { currentUser } = useCurrentUser();

  const insert = async (data: Omit<T, 'accountid'>) => {
    if (!currentUser?.accountid) {
      throw new Error('Usuário não autenticado');
    }

    const dataWithAccountId = {
      ...data,
      accountid: currentUser.accountid,
    };

    const { data: result, error } = await supabase
      .from(table)
      .insert([dataWithAccountId]);

    if (error) throw error;
    return result;
  };

  return { insert };
};

// Hook específico para atualização de dados
export const useSupabaseUpdate = <T extends object>(table: string) => {
  const { currentUser } = useCurrentUser();

  const update = async (id: string | number, data: Partial<T>) => {
    if (!currentUser?.accountid) {
      throw new Error('Usuário não autenticado');
    }

    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .match({ id, accountid: currentUser.accountid });

    if (error) throw error;
    return result;
  };

  return { update };
};

// Hook específico para deleção de dados
export const useSupabaseDelete = (table: string) => {
  const { currentUser } = useCurrentUser();

  const remove = async (id: string | number) => {
    if (!currentUser?.accountid) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from(table)
      .delete()
      .match({ id, accountid: currentUser.accountid });

    if (error) throw error;
    return data;
  };

  return { remove };
};
