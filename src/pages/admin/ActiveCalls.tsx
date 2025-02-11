import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Phone, Clock, Grid, LayoutList, PhoneCall, PhoneOff, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface ActiveCall {
  Accountcode: string;
  CallerID: string;
  Channel: string;
  Duration: string;
  Extension: string;
  State: string;
  username?: string;
}

interface DuplicateRamal {
  ramal: string;
  count: number;
  calls: ActiveCall[];
}

export function AdminActiveCalls() {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [duplicateRamais, setDuplicateRamais] = useState<DuplicateRamal[]>([]);

  const fetchUsernames = async (calls: ActiveCall[]) => {
    const ramais = calls.map(call => getRamal(call.Channel)).filter(ramal => ramal !== 'N/A');
    
    if (ramais.length === 0) return calls;

    const { data: extensionsData, error } = await supabase
      .from('extensions')
      .select('numero, username')
      .in('numero', ramais);

    if (error) {
      console.error('Erro ao buscar usernames:', error);
      return calls;
    }

    const usernameMap = new Map(
      extensionsData.map(ext => [ext.numero, ext.username])
    );

    return calls.map(call => ({
      ...call,
      username: usernameMap.get(getRamal(call.Channel)) || 'N/A'
    }));
  };

  const checkDuplicateRamais = (calls: ActiveCall[]) => {
    const ramalCounts = new Map<string, ActiveCall[]>();
    
    calls.forEach(call => {
      const ramal = getRamal(call.Channel);
      if (!ramalCounts.has(ramal)) {
        ramalCounts.set(ramal, []);
      }
      ramalCounts.get(ramal)?.push(call);
    });

    const duplicates: DuplicateRamal[] = [];
    ramalCounts.forEach((calls, ramal) => {
      if (calls.length > 1) {
        duplicates.push({
          ramal,
          count: calls.length,
          calls
        });
      }
    });

    setDuplicateRamais(duplicates);
  };

  const fetchActiveCalls = async () => {
    try {
      const response = await fetch(
        'https://intermed.appinovavoip.com:3000/active-calls?adminpass=35981517Biu',
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': '191e8a1e-d313-4e12-b608-d1a759b1a106'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const callsWithUsernames = await fetchUsernames(data);
      setActiveCalls(callsWithUsernames);
      checkDuplicateRamais(callsWithUsernames);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar chamadas ativas:', error);
      setError('Erro ao carregar chamadas ativas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCalls();
    const interval = setInterval(fetchActiveCalls, 3000);
    return () => clearInterval(interval);
  }, []);

  const getRamal = (channel: string) => {
    const match = channel.match(/PJSIP\/(\d{4})/);
    return match ? match[1] : 'N/A';
  };

  const getCallStatus = (state: string) => {
    return state === 'Ring' ? 'Chamando' : state === 'Up' ? 'Falando' : state;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-xl w-10 h-10" />
            <div>
              <div className="h-8 w-48 bg-gray-100 rounded-lg" />
              <div className="mt-2 h-4 w-64 bg-gray-100 rounded-lg" />
            </div>
          </div>
          <div className="h-8 w-32 bg-gray-100 rounded-full" />
        </div>

        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50/50">
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-100 rounded-lg" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-5 bg-gray-100 rounded-lg w-24" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-xl">
              <Phone className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chamadas Ativas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitoramento em tempo real das chamadas ativas no sistema
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Erro ao carregar chamadas
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {error}
              </p>
              <button
                onClick={fetchActiveCalls}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-xl">
            <Phone className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chamadas Ativas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitoramento em tempo real das chamadas ativas no sistema
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Atualizado a cada 3s
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <LayoutList className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
          <Badge className="bg-green-500/10 text-green-700 px-3 py-1 rounded-full font-medium">
            {activeCalls.length} chamadas ativas
          </Badge>
        </div>
      </div>

      {duplicateRamais.length > 0 && (
        <div className="mb-4">
          {duplicateRamais.map((duplicate) => (
            <div 
              key={duplicate.ramal}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2"
            >
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">
                  Ramal {duplicate.ramal} está em {duplicate.count} chamadas simultâneas
                </span>
              </div>
              <div className="mt-2 pl-7 space-y-1">
                {duplicate.calls.map((call, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    • {call.CallerID} → {call.Extension} ({call.Duration})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCalls.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sem chamadas ativas</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              Não há chamadas ativas no momento. As chamadas aparecerão aqui assim que forem iniciadas.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Verificando a cada 3 segundos
            </div>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ramal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Duração
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CallerID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {activeCalls.map((call, index) => (
                  <tr 
                    key={index} 
                    className={`
                      hover:bg-gray-50/50 transition-colors
                      ${duplicateRamais.some(d => d.ramal === getRamal(call.Channel)) 
                        ? 'bg-yellow-50/50' 
                        : ''
                      }
                    `}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {getRamal(call.Channel)}
                        </div>
                        {duplicateRamais.some(d => d.ramal === getRamal(call.Channel)) && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {call.username || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {call.Extension}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {call.Duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {call.CallerID}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={`
                          px-3 py-1 rounded-full font-medium
                          ${call.State === 'Up' 
                            ? 'bg-green-500/10 text-green-700'
                            : call.State === 'Ring'
                            ? 'bg-yellow-500/10 text-yellow-700'
                            : 'bg-gray-500/10 text-gray-700'
                          }
                        `}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`
                            w-1.5 h-1.5 rounded-full
                            ${call.State === 'Up' 
                              ? 'bg-green-500'
                              : call.State === 'Ring'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                            }
                          `} />
                          {getCallStatus(call.State)}
                        </div>
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCalls.map((call, index) => (
            <div 
              key={index}
              className={`
                bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4 
                hover:shadow-md transition-shadow
                ${duplicateRamais.some(d => d.ramal === getRamal(call.Channel)) 
                  ? 'ring-yellow-300 bg-yellow-50/50' 
                  : ''
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg
                    ${duplicateRamais.some(d => d.ramal === getRamal(call.Channel))
                      ? 'bg-yellow-100'
                      : call.State === 'Up' 
                      ? 'bg-green-50' 
                      : call.State === 'Ring'
                      ? 'bg-yellow-50'
                      : 'bg-gray-50'
                    }
                  `}>
                    {duplicateRamais.some(d => d.ramal === getRamal(call.Channel)) ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    ) : call.State === 'Up' ? (
                      <PhoneCall className="h-5 w-5 text-green-600" />
                    ) : call.State === 'Ring' ? (
                      <Phone className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <PhoneOff className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Ramal {getRamal(call.Channel)}</div>
                    <div className="text-sm text-gray-500">{call.username || 'N/A'}</div>
                  </div>
                </div>
                <Badge
                  className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${call.State === 'Up' 
                      ? 'bg-green-500/10 text-green-700'
                      : call.State === 'Ring'
                      ? 'bg-yellow-500/10 text-yellow-700'
                      : 'bg-gray-500/10 text-gray-700'
                    }
                  `}
                >
                  {getCallStatus(call.State)}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Destino</span>
                  <span className="font-medium text-gray-900">{call.Extension}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duração</span>
                  <span className="font-medium text-gray-900">{call.Duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">CallerID</span>
                  <span className="font-medium text-gray-900">{call.CallerID}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Account: {call.Accountcode}</span>
                  <span>Channel: {call.Channel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
