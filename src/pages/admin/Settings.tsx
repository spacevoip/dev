import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Loader2, Database, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface DatabaseStatus {
  isConnected: boolean;
  latency: number | null;
  lastChecked: Date;
  checking: boolean;
}

export const AdminSettings = () => {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    isConnected: false,
    latency: null,
    lastChecked: new Date(),
    checking: true
  });

  // Função para verificar o status do banco
  const checkDatabaseStatus = async () => {
    setDbStatus(prev => ({ ...prev, checking: true }));
    
    try {
      const startTime = performance.now();
      
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (error) throw error;

      setDbStatus({
        isConnected: true,
        latency,
        lastChecked: new Date(),
        checking: false
      });
    } catch (error) {
      console.error('Erro ao verificar status do banco:', error);
      setDbStatus({
        isConnected: false,
        latency: null,
        lastChecked: new Date(),
        checking: false
      });
    }
  };

  // Verifica o status a cada 10 segundos
  useEffect(() => {
    checkDatabaseStatus();
    
    const interval = setInterval(() => {
      checkDatabaseStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
      </div>
      
      <div className="grid gap-6">
        {/* Status do Banco de Dados */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-violet-100">
                  <Database className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Status do Banco de Dados</h2>
                  <p className="text-sm text-gray-500">
                    Última verificação: {dbStatus.lastChecked.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Status da Conexão */}
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`px-3 py-1 ${
                      dbStatus.checking
                        ? 'bg-gray-100 text-gray-600'
                        : dbStatus.isConnected
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {dbStatus.checking ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : dbStatus.isConnected ? (
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    {dbStatus.checking
                      ? 'Verificando...'
                      : dbStatus.isConnected
                      ? 'Conectado'
                      : 'Desconectado'}
                  </Badge>
                </div>

                {/* Latência */}
                {dbStatus.isConnected && dbStatus.latency && (
                  <Badge className="px-3 py-1 bg-blue-100 text-blue-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {dbStatus.latency}ms
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};