import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Phone, Clock } from "lucide-react";

interface ActiveCall {
  Accountcode: string;
  CallerID: string;
  Channel: string;
  Duration: string;
  Extension: string;
  State: string;
}

export function AdminActiveCalls() {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setActiveCalls(data);
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
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chamadas Ativas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitoramento em tempo real das chamadas ativas no sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-500 text-white">
            {activeCalls.length} chamadas ativas
          </Badge>
        </div>
      </div>

      {activeCalls.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          <Phone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sem chamadas ativas</h3>
          <p className="mt-1 text-sm text-gray-500">Não há chamadas ativas no momento.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ramal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CallerID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status da Chamada
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeCalls.map((call, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRamal(call.Channel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.Extension}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.Duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.CallerID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={`${
                        call.State === 'Up'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {getCallStatus(call.State)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
