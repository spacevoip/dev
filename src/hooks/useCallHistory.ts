import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CDRRecord } from '../types/cdr';

interface UseCallHistoryProps {
  currentPage: number;
  itemsPerPage: number;
  searchQuery?: string;
}

interface UseCallHistoryResult {
  data: CDRRecord[] | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
}

export const useCallHistory = ({
  currentPage,
  itemsPerPage,
  searchQuery = '',
}: UseCallHistoryProps): UseCallHistoryResult => {
  const [data, setData] = useState<CDRRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();

  // Calcular o offset baseado na página atual
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const fetchData = async () => {
    try {
      if (!user?.accountid) {
        setError('Usuário não autenticado');
        return;
      }

      setLoading(true);
      setError(null);

      // Primeiro, vamos buscar o total de registros
      const { count, error: countError } = await supabase
        .from('cdr')
        .select('*', { count: 'exact', head: true })
        .eq('accountid', user.accountid);

      if (countError) {
        throw countError;
      }

      setTotalCount(count || 0);

      // Primeiro buscamos os registros CDR
      let query = supabase
        .from('cdr')
        .select('*')
        .eq('accountid', user.accountid)
        .order('start', { ascending: false });

      // Aplicar filtro de busca se houver
      if (searchQuery) {
        query = query.or(`channel.ilike.%${searchQuery}%,dst.ilike.%${searchQuery}%`);
      }

      // Aplicar paginação
      query = query.range(from, to);

      const { data: records, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setData(records);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      setError('Erro ao carregar histórico de chamadas');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.accountid, currentPage, itemsPerPage, searchQuery]);

  return {
    data,
    loading,
    error,
    totalCount,
    refetch: fetchData,
  };
};
