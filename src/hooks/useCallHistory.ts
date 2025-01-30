import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UseCallHistoryProps {
  currentPage: number;
  itemsPerPage: number;
  searchQuery?: string;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    minDuration?: number;
    maxDuration?: number;
    status?: string;
  };
  sortBy?: {
    column: string;
    direction: 'asc' | 'desc';
  };
}

export function useCallHistory({
  currentPage,
  itemsPerPage,
  searchQuery = '',
  filters = {},
  sortBy = { column: 'start', direction: 'desc' }
}: UseCallHistoryProps) {
  const { user } = useAuth();
  const accountId = user?.accountid;

  return useQuery({
    queryKey: ['callHistory', accountId, currentPage, itemsPerPage, searchQuery, filters, sortBy],
    queryFn: async () => {
      if (!accountId) {
        return { data: [], count: 0 };
      }

      let query = supabase
        .from('cdr')
        .select('*', { count: 'exact' })
        .eq('accountid', accountId)
        .order(sortBy.column, { ascending: sortBy.direction === 'asc' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      // Aplicar filtros de data
      if (filters.startDate) {
        query = query.gte('start', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('start', filters.endDate.toISOString());
      }

      // Aplicar filtros de duração
      if (filters.minDuration) {
        query = query.gte('billsec', filters.minDuration);
      }
      if (filters.maxDuration) {
        query = query.lte('billsec', filters.maxDuration);
      }

      // Aplicar filtro de status
      if (filters.status) {
        query = query.eq('disposition', filters.status);
      }

      // Aplicar busca
      if (searchQuery) {
        query = query.or(`channel.ilike.%${searchQuery}%,dst.ilike.%${searchQuery}%,disposition.ilike.%${searchQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar histórico de chamadas:', error);
        console.log('Query params:', {
          accountId,
          currentPage,
          itemsPerPage,
          searchQuery,
          filters,
          sortBy
        });
        return { data: [], count: 0 };
      }

      return { data: data || [], count: count || 0 };
    },
    enabled: !!accountId,
    staleTime: 30000, // 30 segundos
  });
}
