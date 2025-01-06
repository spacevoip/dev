import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

// Tipo genérico para os dados retornados
export interface AdminQueryResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAdminSupabaseQuery = <T>(
  table: string,
  options: {
    select?: string;
    additionalFilters?: (query: any) => any;
    enabled?: boolean;
  } = {}
): AdminQueryResult<T> => {
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

      // Aplica filtros adicionais se fornecidos
      if (options.additionalFilters) {
        query = options.additionalFilters(query);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData(result as T[]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [options.enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
