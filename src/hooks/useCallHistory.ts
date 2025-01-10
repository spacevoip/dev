import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CDRRecord } from '../types';

interface UseCallHistoryProps {
  currentPage: number;
  itemsPerPage: number;
  searchQuery?: string;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    type?: 'inbound' | 'outbound' | 'all';
    minDuration?: number;
    maxDuration?: number;
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

  const query = useQuery({
    queryKey: ['callHistory', accountId, currentPage, itemsPerPage, searchQuery, filters, sortBy],
    queryFn: async () => {
      if (!accountId) {
        return [];
      }

      let query = supabase
        .from('cdr')
        .select('*')
        .eq('accountid', accountId)
        .order(sortBy.column, { ascending: sortBy.direction === 'asc' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      // Aplicar filtros
      if (filters.startDate) {
        query = query.gte('start', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('start', filters.endDate.toISOString());
      }
      if (filters.status) {
        query = query.eq('disposition', filters.status);
      }
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.minDuration) {
        query = query.gte('billsec', filters.minDuration);
      }
      if (filters.maxDuration) {
        query = query.lte('billsec', filters.maxDuration);
      }
      if (searchQuery) {
        query = query.or(`
          src.ilike.%${searchQuery}%,
          dst.ilike.%${searchQuery}%,
          disposition.ilike.%${searchQuery}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar histórico de chamadas:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!accountId,
    staleTime: 30000, // 30 segundos
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    isRefetching: query.isRefetching
  };
}
