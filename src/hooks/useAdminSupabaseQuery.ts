import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

interface QueryOptions {
  select?: string;
  additionalFilters?: (query: any) => any;
  enabled?: boolean;
  orderBy?: string;
}

// Tipo genérico para os dados retornados
export interface AdminQueryResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAdminSupabaseQuery = <T>({
  table,
  ...options
}: {
  table: string;
} & QueryOptions): AdminQueryResult<T> => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(table)
        .select(options.select || '*');

      // Aplica ordenação se fornecida
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: true });
      }

      // Aplica filtros adicionais se fornecidos
      if (options.additionalFilters) {
        query = options.additionalFilters(query);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData(result as T[]);
    } catch (err) {
      console.error('Query error:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [table, options.select, options.enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
