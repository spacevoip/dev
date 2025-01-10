import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { CallHistoryList } from '../components/Calls/CallHistory/CallHistoryList';
import { CallHistoryChart } from '../components/Calls/CallHistory/CallHistoryChart';
import { CallHistoryFilters } from '../components/Calls/CallHistory/CallHistoryFilters';
import { RefreshButton } from '../components/Common/RefreshButton';
import { Pagination } from '../components/Common/Pagination';
import { Button } from '../components/Common/Button';
import { formatDuration, formatExtension, formatCallStatus } from '../utils/formatters';
import type { CallHistory } from '../types';
import { useCallHistory } from '../hooks/useCallHistory';
import { Phone, Download, Grid, List } from 'lucide-react';
import debounce from 'lodash/debounce';
import { format } from 'date-fns';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQueryClient } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

let XLSX: any = null;

// Carregamento dinâmico do XLSX
const loadXLSX = async () => {
  if (!XLSX) {
    XLSX = await import('xlsx/dist/xlsx.full.min.js');
  }
  return XLSX;
};

const ITEMS_PER_PAGE = 17;

export const History = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });
  const [filters, setFilters] = useState({
    type: 'all',
    status: '',
    duration: '',
  });
  const [sortBy, setSortBy] = useState({ column: 'start', direction: 'desc' as 'asc' | 'desc' });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCalls, setSelectedCalls] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const prefetchDirection = useRef<'next' | 'prev'>('next');

  const {
    data: cdrRecords,
    loading,
    error,
    totalCount,
    refetch,
    isRefetching
  } = useCallHistory({
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    searchQuery,
    filters: {
      ...filters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    sortBy,
  });

  // Virtualização
  const rowVirtualizer = useVirtualizer({
    count: cdrRecords?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  // Prefetch
  useEffect(() => {
    const page = prefetchDirection.current === 'next' ? currentPage + 1 : currentPage - 1;
    if (page > 0 && page <= Math.ceil(totalCount / ITEMS_PER_PAGE)) {
      queryClient.prefetchQuery(['callHistory', { page }]);
    }
  }, [currentPage, queryClient, totalCount]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'ArrowLeft' && e.altKey) {
        setCurrentPage(prev => Math.max(1, prev - 1));
      }
      if (e.key === 'ArrowRight' && e.altKey) {
        setCurrentPage(prev => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [totalCount]);

  // Debounced search com rate limiting
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  // Converter os registros CDR para o formato CallHistory
  const callHistory: CallHistory[] = useMemo(() => 
    (cdrRecords || []).map(record => ({
      id: String(record.id),
      from: formatExtension(record.channel),
      to: record.dst,
      duration: record.billsec || 0,
      formattedDuration: formatDuration(record.billsec),
      status: formatCallStatus(record.disposition),
      start: record.start,
      timestamp: new Date(record.start),
      recordingUrl: record.recording_url,
    })), [cdrRecords]);

  // Funções de exportação
  const handleExportCSV = () => {
    const csvContent = [
      ['Data', 'De', 'Para', 'Duração', 'Status'].join(','),
      ...callHistory.map(call => [
        format(call.timestamp, 'dd/MM/yyyy HH:mm:ss'),
        call.from,
        call.to,
        call.formattedDuration,
        call.status,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico_chamadas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const handleExportExcel = async () => {
    const XLSXLoaded = await loadXLSX();
    const ws = XLSXLoaded.utils.json_to_sheet(
      callHistory.map(call => ({
        Data: format(call.timestamp, 'dd/MM/yyyy HH:mm:ss'),
        De: call.from,
        Para: call.to,
        Duração: call.formattedDuration,
        Status: call.status,
      }))
    );
    const wb = XLSXLoaded.utils.book_new();
    XLSXLoaded.utils.book_append_sheet(wb, ws, 'Histórico');
    XLSXLoaded.writeFile(wb, `historico_chamadas_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Data', 'De', 'Para', 'Duração', 'Status']],
      body: callHistory.map(call => [
        format(call.timestamp, 'dd/MM/yyyy HH:mm:ss'),
        call.from,
        call.to,
        call.formattedDuration,
        call.status,
      ]),
    });
    doc.save(`historico_chamadas_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="p-1"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="p-1"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative group">
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block">
              <button
                onClick={handleExportCSV}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Exportar como CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Exportar como Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Exportar como PDF
              </button>
            </div>
          </div>

          <RefreshButton 
            onRefresh={refetch} 
            loading={isRefetching}
          />
        </div>
      </div>

      {/* Filters */}
      <CallHistoryFilters
        onSearch={handleSearch}
        onDateRangeChange={setDateRange}
        onFilterChange={setFilters}
        filters={filters}
        searchInputRef={searchInputRef}
      />

      {/* Chart with Stats */}
      <CallHistoryChart calls={callHistory} />

      {/* Main Content */}
      <div className="space-y-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        ) : (
          <div ref={parentRef} className="h-[600px] overflow-auto">
            <CallHistoryList
              calls={callHistory}
              loading={loading}
              error={error}
              onSort={(column) => {
                setSortBy(prev => ({
                  column,
                  direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc'
                }));
              }}
              sortBy={sortBy}
              viewMode={viewMode}
              selectedCalls={selectedCalls}
              onSelectCall={(id) => {
                setSelectedCalls(prev => 
                  prev.includes(id) 
                    ? prev.filter(callId => callId !== id)
                    : [...prev, id]
                );
              }}
              virtualizer={rowVirtualizer}
            />
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {firstItemIndex} até {lastItemIndex} de {totalCount} resultados
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              prefetchDirection.current = page > currentPage ? 'next' : 'prev';
              setCurrentPage(page);
            }}
          />
        </div>
      </div>
    </div>
  );
};