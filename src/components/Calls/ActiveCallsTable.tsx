import React, { useState, useEffect, useRef } from 'react';
import { useActiveCalls } from '../../hooks/useActiveCalls';
import { useExtensions } from '../../hooks/useExtensions';
import { useAuth } from '../../contexts/AuthContext';
import { PhoneXMarkIcon } from '@heroicons/react/24/outline';
import { PhoneIcon, PhoneForwarded, AlertCircle, Keyboard, RefreshCw, Download } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import type { ActiveCall, DTMFCapture } from '../../types';
import { Toaster, toast } from 'react-hot-toast';
import { Extension } from '../../hooks/useExtensions';
import { format } from 'date-fns';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActiveCallsTableProps {
  calls: ActiveCall[];
}

const ActiveCallsTable: React.FC<ActiveCallsTableProps> = ({ calls }) => {
  const { refetch } = useActiveCalls();
  const { data: extensions = [], isLoading: extensionsLoading, error: extensionsError } = useExtensions();
  const { user } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDTMFOpen, setIsDTMFOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Extension | null>(null);
  const [transferExtension, setTransferExtension] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Filtra os ramais com base na busca
  const filteredExtensions = extensions.filter(ext => {
    if (!ext || !ext.extension || !ext.nome) return false;
    const query = searchQuery.toLowerCase();
    return ext.extension.toLowerCase().includes(query) ||
           ext.nome.toLowerCase().includes(query);
  });

  // Consulta DTMF usando o hook personalizado
  const { data: dtmfData, refetch: refetchDTMF, loading: dtmfLoading } = useSupabaseQuery<DTMFCapture>('dtmfcapture', {
    select: 'id,created_at,digit,channel,callerid,origem',
    additionalFilters: (query) => {
      if (!selectedChannel) return query;
      return query
        .eq('channel', selectedChannel)
        .order('created_at', { ascending: true });
    },
    enabled: isDTMFOpen && !!selectedChannel,
    skipAccountFilter: true
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd/MM/yyyy HH:mm:ss');
  };

  const handleDTMFClick = (channel: string, extension: string) => {
    setSelectedChannel(channel);
    setSelectedExtension(extension);
    setIsDTMFOpen(true);
  };

  // Função para fazer o refresh manual
  const handleManualRefresh = async () => {
    if (isManualRefreshing) return;

    try {
      setIsManualRefreshing(true);
      await refetchDTMF();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }

    // Garante que o ícone gire por pelo menos 500ms para feedback visual
    refreshTimeoutRef.current = setTimeout(() => {
      setIsManualRefreshing(false);
    }, 500);
  };

  // Limpa o timeout do refresh ao desmontar
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Atualização automática a cada 5 segundos
  useEffect(() => {
    let isSubscribed = true;
    let retryCount = 0;
    const maxRetries = 3;

    const startInterval = async () => {
      if (!isSubscribed) return;
      
      try {
        await refetchDTMF();
        retryCount = 0;
        
        if (!isSubscribed) return;
        
        intervalRef.current = setInterval(async () => {
          try {
            await refetchDTMF();
          } catch (error) {
            console.error('Erro ao atualizar dados DTMF:', error);
            retryCount++;
            
            if (retryCount >= maxRetries) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
            }
          }
        }, 5000);
      } catch (error) {
        console.error('Erro ao iniciar atualização DTMF:', error);
      }
    };

    if (isDTMFOpen && selectedChannel) {
      startInterval();
    }

    return () => {
      isSubscribed = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDTMFOpen, selectedChannel, refetchDTMF]);

  const handleHangupClick = (channel: string) => {
    setSelectedChannel(channel);
    setIsConfirmOpen(true);
  };

  const handleTransferClick = (channel: string, extension: string) => {
    if (!user?.accountid) {
      toast('Erro: Usuário não identificado', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }
    // Guardamos o ramal que está em chamada
    setSelectedExtension(extension);
    setSelectedChannel(channel);
    setIsTransferOpen(true);
    setSearchQuery('');
  };

  const handleTransferConfirm = async () => {
    if (!selectedExtension || !selectedDestination) {
      toast('Selecione um ramal de destino', {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 173dc732-6b80-403a-9c0a-28bbfda79588'
        },
        body: JSON.stringify({
          extension: selectedExtension,
          destination: selectedDestination.extension,
          type: 'blind'
        }),
      });

      const data = await response.json();

      // Se a resposta contiver o erro específico do ManagerMsg
      if (data.error === "'ManagerMsg' object has no attribute 'keys'" && data.success === false) {
        toast('Chamada transferida com sucesso!', {
          icon: '✅',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        
        await refetch();
        handleTransferModalClose();
        return;
      }

      // Para outros casos de erro
      if (!data.success || data.error) {
        let errorMessage = 'Erro ao transferir chamada';
        
        if (data.error === "No active channel found for extension " + selectedExtension) {
          errorMessage = `O ramal ${selectedExtension} não possui chamada ativa para transferir`;
        }
        
        throw new Error(errorMessage);
      }

      toast('Chamada transferida com sucesso!', {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      await refetch();
      handleTransferModalClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Erro ao transferir chamada', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  const handleHangupConfirm = async () => {
    if (!selectedChannel) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) throw new Error('API URL não configurada');
      
      const apiUrl = API_URL.startsWith('https://') ? API_URL : `https://${API_URL}`;
      const response = await fetch(`${apiUrl}/hangup-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          channel: selectedChannel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Erro ao desligar chamada');
      }

      await refetch();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Erro ao desligar chamada', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } finally {
      setIsConfirmOpen(false);
      setSelectedChannel(null);
    }
  };

  const handleTransferModalClose = () => {
    setIsTransferOpen(false);
    setSelectedDestination(null);
    setSelectedExtension(null);
    setSelectedChannel(null);
  };

  if (!calls.length) {
    return (
      <div className="text-center py-12">
        <PhoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma chamada ativa</h3>
        <p className="text-gray-500">Não há chamadas em andamento no momento.</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ramal
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Caller ID
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Destino
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Duração
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {calls.map((call) => (
              <tr 
                key={call.channel}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-2 rounded-lg">
                      <PhoneIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{call.ramal}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{call.callerid}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{call.destino}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{call.duracao}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    call.status === 'Chamando' 
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {call.status === 'Chamando' ? (
                      <>
                        <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse mr-1.5"></span>
                        {call.status}
                      </>
                    ) : (
                      <>
                        <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5"></span>
                        {call.status}
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    {call.status === 'Falando' && (
                      <>
                        <button
                          onClick={() => handleDTMFClick(call.channel, call.ramal)}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-full transition-colors duration-200"
                          title="Ver histórico DTMF"
                        >
                          <Keyboard className="h-5 w-5 stroke-2" />
                        </button>
                        <button
                          onClick={() => handleTransferClick(call.channel, call.ramal)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors duration-200"
                          title="Transferir chamada"
                        >
                          <PhoneForwarded className="h-5 w-5 stroke-2" />
                        </button>
                        <button
                          onClick={() => handleHangupClick(call.channel)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors duration-200"
                          title="Encerrar chamada"
                        >
                          <PhoneXMarkIcon className="h-5 w-5 stroke-2" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal DTMF */}
      <Dialog
        open={isDTMFOpen}
        onClose={() => {
          setIsDTMFOpen(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
          <Dialog.Panel className="w-full max-w-[95%] sm:max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <Dialog.Title className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Keyboard className="h-5 w-5" />
                    <span className="truncate">
                      Histórico DTMF - {selectedExtension || 'Desconhecido'}
                    </span>
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-500 mt-1">
                    Histórico de dígitos DTMF recebidos durante a chamada
                  </Dialog.Description>
                </div>

                {/* Botões em tela pequena ficam embaixo */}
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={handleManualRefresh}
                    disabled={isManualRefreshing}
                    className="flex-1 sm:flex-none h-9 px-3 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <RefreshCw 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isManualRefreshing ? 'animate-spin' : ''
                      }`}
                    />
                    <span className="ml-2">Atualizar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (dtmfData?.length) {
                        const csvContent = [
                          ['Hora', 'Dígito', 'Origem'],
                          ...dtmfData.map(dtmf => [
                            formatDate(dtmf.created_at),
                            dtmf.digit,
                            dtmf.origem
                          ])
                        ].map(row => row.join(',')).join('\n');

                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `dtmf_historico_${selectedExtension}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      }
                    }}
                    className="flex-1 sm:flex-none h-9 px-3 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    disabled={!dtmfData?.length}
                  >
                    <Download className="h-4 w-4" />
                    <span className="ml-2">Baixar CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4 sm:p-6">
              <div className="bg-gray-50 rounded-lg">
                {/* Info de atualização */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <span className="text-xs text-gray-500">
                    Atualização automática a cada 5s
                  </span>
                </div>

                {/* Tabela com scroll */}
                <div className="max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
                  <div className="min-w-full divide-y divide-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="py-2 px-3 sm:px-4">Hora</TableHead>
                          <TableHead className="py-2 px-3 sm:px-4">Dígito</TableHead>
                          <TableHead className="py-2 px-3 sm:px-4">Origem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dtmfData?.map((dtmf) => (
                          <TableRow key={dtmf.id}>
                            <TableCell className="whitespace-nowrap py-2 px-3 sm:px-4 text-sm">
                              {formatDate(dtmf.created_at)}
                            </TableCell>
                            <TableCell className="text-center font-semibold py-2 px-3 sm:px-4 text-sm">
                              {dtmf.digit}
                            </TableCell>
                            <TableCell className="py-2 px-3 sm:px-4 text-sm">
                              {dtmf.origem}
                            </TableCell>
                          </TableRow>
                        ))}
                        {!dtmfData?.length && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-gray-500 text-sm">
                              Nenhum DTMF recebido
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de Confirmação de Desligamento */}
      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Confirmar encerramento
            </Dialog.Title>

            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Tem certeza que deseja encerrar esta chamada?
              </p>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                onClick={handleHangupConfirm}
              >
                Encerrar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de Transferência */}
      <Dialog
        open={isTransferOpen}
        onClose={handleTransferModalClose}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Transferir Chamada do Ramal {selectedExtension}
            </Dialog.Title>

            {selectedDestination ? (
              <div className="mt-4">
                <div className="mb-4 rounded-lg bg-violet-50 p-4">
                  <p className="font-medium text-violet-900">Ramal selecionado:</p>
                  <p className="text-violet-700">
                    {selectedDestination.extension} - {selectedDestination.nome}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Barra de Pesquisa */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Buscar ramal por número ou nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Lista de Ramais */}
                <div className="mt-4 max-h-[400px] overflow-y-auto">
                  {extensionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-violet-600 border-t-transparent"></div>
                    </div>
                  ) : extensionsError ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-red-600">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-center">Erro ao carregar ramais</p>
                    </div>
                  ) : filteredExtensions.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      {searchQuery ? 'Nenhum ramal encontrado' : 'Nenhum ramal disponível'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {filteredExtensions
                        .filter(ext => ext.extension !== selectedExtension)
                        .map((ext) => (
                          <button
                            key={ext.extension}
                            onClick={() => setSelectedDestination(ext)}
                            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                          >
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium text-gray-900">
                                Ramal {ext.extension}
                              </span>
                              <span className="text-sm text-gray-500">
                                {ext.nome} ({ext.callerid})
                              </span>
                            </div>
                            <div className={`h-2.5 w-2.5 rounded-full ${
                              ext.snystatus === 'Online (Livre)' ? 'bg-green-500' : 'bg-gray-300'
                            }`} 
                            title={ext.snystatus === 'Online (Livre)' ? 'Online' : 'Offline'}
                            />
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Botões de Ação */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleTransferModalClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                Cancelar
              </button>
              
              {selectedDestination && (
                <button
                  type="button"
                  onClick={handleTransferConfirm}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  Confirmar Transferência
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default ActiveCallsTable;
