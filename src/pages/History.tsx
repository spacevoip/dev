import React, { useState } from 'react';
import { CallHistoryList } from '../components/Calls/CallHistory/CallHistoryList';
import { RefreshButton } from '../components/Common/RefreshButton';
import { Pagination } from '../components/Common/Pagination';
import { SearchInput } from '../components/Common/SearchInput';
import { formatDuration, formatExtension, formatCallStatus } from '../utils/formatters';
import type { CallHistory } from '../types';
import { useCallHistory } from '../hooks/useCallHistory';
import { Phone } from 'lucide-react';

const ITEMS_PER_PAGE = 17;

export const History = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const {
    data: cdrRecords,
    loading,
    error,
    totalCount,
    refetch
  } = useCallHistory({
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    searchQuery
  });

  // Converter os registros CDR para o formato CallHistory
  const callHistory: CallHistory[] = (cdrRecords || []).map(record => ({
    id: String(record.id),
    from: formatExtension(record.channel),
    to: record.dst,
    duration: record.billsec || 0,
    formattedDuration: formatDuration(record.billsec),
    status: formatCallStatus(record.disposition),
    start: record.start,
    timestamp: new Date(record.start),
    recordingUrl: record.recording_url,
  }));

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleRefresh = () => {
    refetch();
    setLastUpdate(new Date());
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Calcular o índice do último item na página atual
  const lastItemIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);
  const firstItemIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10">
            <Phone className="h-5 w-5 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Chamadas</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </span>
          <RefreshButton onRefresh={handleRefresh} />
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <SearchInput
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Buscar por ramal ou destino..."
          />
          <p className="text-sm text-gray-500">
            Pressione Enter para buscar
          </p>
        </div>
        <div className="flex items-center justify-end">
          <div className="bg-white rounded-xl shadow-sm px-6 py-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Chamadas</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div>
                <p className="text-sm font-medium text-gray-500">Exibindo</p>
                <p className="text-lg font-medium text-gray-900">
                  {totalCount > 0 ? `${firstItemIndex} - ${lastItemIndex}` : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        ) : (
          <>
            <CallHistoryList
              calls={callHistory}
              loading={loading}
              error={error}
            />

            {!loading && totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};