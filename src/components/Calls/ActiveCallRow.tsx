import { Phone, PhoneOff, PhoneForwarded, Search, Keyboard, RefreshCw, Download } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useCallDuration } from '../../hooks/useCallDuration';
import { AgentActiveCall } from '../../hooks/useAgentActiveCalls';
import { ConsultaCampanhaModal } from './ConsultaCampanhaModal';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

interface DTMFCapture {
  id: string;
  created_at: string;
  digit: string;
  channel: string;
  callerid: string;
  origem: string;
}

interface ActiveCallRowProps {
  call: AgentActiveCall;
  formatDuration: (duration: string | number) => string;
  onHangup?: (channel: string) => void;
  onTransfer?: (channel: string) => void;
}

export function ActiveCallRow({ call, formatDuration, onHangup, onTransfer }: ActiveCallRowProps) {
  const [isConsultaModalOpen, setIsConsultaModalOpen] = useState(false);
  const [isDTMFOpen, setIsDTMFOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const channelParts = call.Channel.split('/');
  const ramal = channelParts[1]?.split('-')[0] || 'N/A';
  const destino = call.Extension || 'N/A';
  const duration = useCallDuration(call.Duration);

  // Consulta DTMF usando o hook personalizado
  const { data: dtmfData, refetch, loading } = useSupabaseQuery<DTMFCapture>('dtmfcapture', {
    select: 'id,created_at,digit,channel,callerid,origem',
    additionalFilters: (query) => {
      if (!call.Channel) return query;
      return query
        .eq('channel', call.Channel)
        .order('created_at', { ascending: true });
    },
    enabled: isDTMFOpen && !!call.Channel,
    skipAccountFilter: true
  });

  // Função para fazer o refresh manual
  const handleManualRefresh = async () => {
    if (isManualRefreshing) return;

    try {
      setIsManualRefreshing(true);
      await refetch();
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
        await refetch();
        retryCount = 0;
        
        if (!isSubscribed) return;
        
        intervalRef.current = setInterval(async () => {
          if (!isSubscribed) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = undefined;
            }
            return;
          }

          try {
            await refetch();
            retryCount = 0;
          } catch (error) {
            console.error('Erro ao atualizar dados DTMF:', error);
            retryCount++;
            
            if (retryCount >= maxRetries) {
              console.error('Máximo de tentativas atingido, parando o refresh');
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = undefined;
              }
            }
          }
        }, 5000);
      } catch (error) {
        console.error('Erro ao iniciar atualização DTMF:', error);
      }
    };

    if (isDTMFOpen && call.Channel) {
      startInterval();
    }

    return () => {
      isSubscribed = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [isDTMFOpen, call.Channel, refetch]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd/MM/yyyy HH:mm:ss');
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span>{call.CallerID || 'Desconhecido'}</span>
          </div>
        </td>
        <td className="py-3 px-4">{ramal}</td>
        <td className="py-3 px-4">{destino}</td>
        <td className="py-3 px-4">
          <Badge
            className={
              call.State === 'Up'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }
          >
            {call.State === 'Up' ? 'Ativa' : call.State}
          </Badge>
        </td>
        <td className="py-3 px-4">
          <span className="font-medium">{formatDuration(duration)}</span>
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onHangup?.(call.Channel)}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onTransfer?.(call.Channel)}
            >
              <PhoneForwarded className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsConsultaModalOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Dialog 
              open={isDTMFOpen} 
              onOpenChange={(open) => {
                setIsDTMFOpen(open);
                if (!open && intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = undefined;
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Keyboard className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Keyboard className="h-5 w-5" />
                    Histórico DTMF - ({call.Extension || 'Desconhecido'})
                  </DialogTitle>
                  <DialogDescription>
                    Histórico de dígitos DTMF recebidos durante a chamada
                  </DialogDescription>
                </DialogHeader>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold">Histórico</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        Atualização automática a cada 5s
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
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
                            a.download = `dtmf_historico_${call.Extension}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          }
                        }}
                        className="h-8 px-2 hover:bg-gray-100"
                        disabled={!dtmfData?.length}
                      >
                        <Download className="h-4 w-4" />
                        <span className="ml-2">Baixar CSV</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleManualRefresh}
                        disabled={isManualRefreshing}
                        className="h-8 px-2 hover:bg-gray-100"
                      >
                        <RefreshCw 
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isManualRefreshing ? 'animate-spin' : ''
                          }`} 
                        />
                        <span className="ml-2">Atualizar</span>
                      </Button>
                    </div>
                  </div>
                  <div className="h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hora</TableHead>
                          <TableHead>Dígito</TableHead>
                          <TableHead>Origem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dtmfData?.map((dtmf) => (
                          <TableRow key={dtmf.id}>
                            <TableCell className="whitespace-nowrap">
                              {formatDate(dtmf.created_at)}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {dtmf.digit}
                            </TableCell>
                            <TableCell>{dtmf.origem}</TableCell>
                          </TableRow>
                        ))}
                        {!dtmfData?.length && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                              Nenhum DTMF recebido
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </td>
      </tr>

      <ConsultaCampanhaModal
        isOpen={isConsultaModalOpen}
        onClose={() => setIsConsultaModalOpen(false)}
        phoneNumber={destino}
      />
    </>
  );
}
