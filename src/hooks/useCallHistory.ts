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
  sortBy = { column: 'calldate', direction: 'desc' }
}: UseCallHistoryProps) {
  const { user } = useAuth();
  const accountId = user?.accountid;

  return useQuery({
    queryKey: ['callHistory', accountId, currentPage, itemsPerPage, searchQuery, JSON.stringify(filters), JSON.stringify(sortBy)],
    queryFn: async () => {
      if (!accountId) {
        return { data: [], count: 0 };
      }

      // Mapeamento de colunas da cdr2 para as colunas que usávamos
      const columnMapping: Record<string, string> = {
        'start': 'calldate',
        'billsec': 'billsec',
        'channel': 'channel',
        'dst': 'dst',
        'disposition': 'disposition'
      };

      // Ajusta a coluna de ordenação se necessário
      const orderColumn = columnMapping[sortBy.column] || sortBy.column;

      // Query principal na tabela cdr2
      let query = supabase
        .from('cdr2')
        .select('*', { count: 'exact' })
        .eq('accountcode', accountId)
        .order(orderColumn, { ascending: sortBy.direction === 'asc' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      // Aplicar filtros de data
      if (filters.startDate) {
        query = query.gte('calldate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('calldate', filters.endDate.toISOString());
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

      const { data: cdr2Data, error: cdr2Error, count } = await query;

      if (cdr2Error) {
        console.error('Erro ao buscar histórico de chamadas:', cdr2Error);
        return { data: [], count: 0 };
      }

      // Se não temos dados da cdr2, retornamos vazio
      if (!cdr2Data || cdr2Data.length === 0) {
        return { data: [], count: 0 };
      }

      // Buscar as URLs de gravação da tabela cdr original
      const uniqueIds = cdr2Data.map(record => record.uniqueid);
      const { data: cdrData } = await supabase
        .from('cdr')
        .select('uniqueid, recording_url')
        .in('uniqueid', uniqueIds);

      // Criar um mapa de uniqueid -> recording_url
      const recordingUrls = new Map(
        cdrData?.map(record => [record.uniqueid, record.recording_url]) || []
      );

      // Combinar os dados da cdr2 com as URLs de gravação
      const combinedData = cdr2Data.map(record => ({
        ...record,
        start: record.calldate, // Mapeando calldate para start
        recording_url: recordingUrls.get(record.uniqueid)
      }));

      return { 
        data: combinedData,
        count: count || 0 
      };
    },
    enabled: !!accountId,
    staleTime: 30000, // 30 segundos
  });
}
