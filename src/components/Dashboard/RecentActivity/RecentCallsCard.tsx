import React from 'react';
import { Phone, Download } from 'lucide-react';
import { formatDuration } from '../../../utils/formatters';
import { useSupabaseQuery } from '../../../hooks/useSupabaseQuery';
import type { CDRRecord } from '../../../types/cdr';

interface Call {
  id: string;
  from: string;
  to: string;
  duration: number;
  timestamp: Date;
  recordingUrl: string | null;
  wasAnswered: boolean;
}

export const RecentCallsCard: React.FC = () => {
  const {
    data: cdrRecords,
    loading,
    error,
    refetch
  } = useSupabaseQuery<CDRRecord>('cdr', {
    select: 'id, uniqueid, channel, dst, billsec, start, recording_url, disposition',
    additionalFilters: (query) => {
      return query
        .order('start', { ascending: false })
        .limit(4);
    },
  });

  // Converter os registros CDR para o formato Call
  const calls: Call[] = (cdrRecords || []).map(record => {
    const formatOrigin = (channel: string) => {
      if (!channel) return 'Unknown';
      
      // Encontra a posição após "PJSIP/"
      const pjsipIndex = channel.indexOf('PJSIP/');
      if (pjsipIndex === -1) return channel;
      
      // Pega os 4 primeiros dígitos após "PJSIP/"
      const startIndex = pjsipIndex + 6; // 6 é o tamanho de "PJSIP/"
      const extensionNumber = channel.substring(startIndex, startIndex + 4);
      
      return extensionNumber || 'Unknown';
    };

    return {
      id: record.uniqueid || record.id,
      from: formatOrigin(record.channel),
      to: record.dst?.replace('PJSIP/', '') || 'Unknown',
      duration: record.billsec || 0,
      timestamp: new Date(record.start),
      recordingUrl: record.recording_url,
      wasAnswered: record.disposition === 'ANSWERED'
    };
  });

  // Atualização automática a cada 30 segundos
  React.useEffect(() => {
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (loading && calls.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold">Chamadas Recentes</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={`skeleton-${i}`} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Phone className="h-5 w-5 text-gray-400" />
        <h2 className="text-lg font-semibold">Chamadas Recentes</h2>
      </div>

      {error ? (
        <div className="text-red-500 text-sm p-4 text-center">
          Erro ao carregar chamadas recentes
        </div>
      ) : calls.length === 0 ? (
        <div className="text-gray-500 text-sm p-4 text-center">
          Nenhuma chamada recente
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div 
                  className={`p-2 rounded-lg ${
                    call.wasAnswered ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <Phone 
                    className={`h-5 w-5 ${
                      call.wasAnswered ? 'text-green-600' : 'text-red-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Origem:</span>
                      <span className="font-medium">{call.from}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Destino:</span>
                      <span className="font-medium">{call.to}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Duração:</span>
                      <span className="font-medium">{formatDuration(call.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {call.recordingUrl && (
                  <a
                    href={call.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Download gravação"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                )}
                <div className="text-sm text-gray-500">
                  <span className="text-gray-600">Data e Hora:</span>{' '}
                  {call.timestamp.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};