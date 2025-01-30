import React, { useEffect } from 'react';
import { AgentLayout } from '../components/Agent/AgentLayout';
import { Card } from '../components/ui/card';
import { useAgent } from '../contexts/AgentContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Phone, PhoneOff, UserCheck, Clock, PhoneForwarded, Coffee, Loader2, RefreshCw, History, PhoneCall, Timer, BarChart, Pencil, AlertCircle } from 'lucide-react';
import { updateAgentStatus, type AgentStatus } from '../lib/agentStatus';
import { updateAgentCallerID } from '../lib/agentAuth';
import { useAgentActiveCalls } from '../hooks/useAgentActiveCalls';
import { useAgentCallHistory } from '../hooks/useAgentCallHistory';
import { useCallStats } from '../hooks/useCallStats';
import { StatCard } from '../components/Stats/StatCard';
import { toast } from 'sonner';
import { ActiveCallRow } from '../components/Calls/ActiveCallRow';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { usePageTitle } from '../hooks/usePageTitle';

export function DashAgente() {
  usePageTitle('Painel do Agente');
  const { agent, setAgent } = useAgent();
  const [status, setStatus] = React.useState<AgentStatus>('offline');
  const [isEditingCallerID, setIsEditingCallerID] = React.useState(false);
  const [newCallerID, setNewCallerID] = React.useState('');
  const [isUpdatingCallerID, setIsUpdatingCallerID] = React.useState(false);
  const { calls: activeCalls, loading: callsLoading, error: callsError, refetch } = useAgentActiveCalls();
  const { calls: historyCalls, loading: historyLoading, error: historyError, refetch: refetchHistory } = useAgentCallHistory();
  const stats = useCallStats(historyCalls);

  useEffect(() => {
    // Inicializa o status do agente baseado no valor do banco de dados
    if (agent?.stagente) {
      setStatus(agent.stagente as AgentStatus);
    }
  }, [agent]);

  const handleStatusChange = async (newStatus: AgentStatus) => {
    if (!agent) return;

    const success = await updateAgentStatus(agent.id, newStatus);
    if (success) {
      setStatus(newStatus);
    }
  };

  const getStatusColor = (status: AgentStatus) => {
    const colors = {
      available: 'bg-green-100 text-green-600 hover:bg-green-200',
      busy: 'bg-red-100 text-red-600 hover:bg-red-200',
      offline: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      pause: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
    };
    return colors[status] || colors.offline;
  };

  const getStatusButtonClass = (buttonStatus: AgentStatus, currentStatus: AgentStatus) => {
    if (buttonStatus === currentStatus) {
      switch (buttonStatus) {
        case 'available':
          return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300';
        case 'busy':
          return 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300';
        case 'pause':
          return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300';
        default:
          return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300';
      }
    }
    return 'bg-white hover:bg-gray-50';
  };

  const formatDuration = (duration: string | number) => {
    const seconds = typeof duration === 'string' ? parseInt(duration) : duration;
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Função para limpar o número, removendo caracteres indesejados
  const cleanPhoneNumber = (number: string) => {
    return number.replace(/[^0-9]/g, '').replace(/^55/, '');
  };

  // Função para validar o formato do número
  const isValidPhoneNumber = (number: string) => {
    const cleaned = cleanPhoneNumber(number);
    return /^[1-9][0-9]{9,10}$/.test(cleaned);
  };

  return (
    <AgentLayout>
      <div className="space-y-6">
        {/* Status do Agente */}
        <Card className="p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Bem-vindo, Agente {agent?.numero}</h2>
              <div className="text-muted-foreground flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Status atual:{' '}
                  <Badge 
                    className={`px-3 py-1 font-medium ${
                      status === 'available' 
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : status === 'busy'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : status === 'pause'
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    {status === 'available'
                      ? 'Disponível'
                      : status === 'busy'
                      ? 'Ocupado'
                      : status === 'pause'
                      ? 'Pausa'
                      : 'Offline'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  CallerID:{' '}
                  <Badge variant="outline" className="px-3 py-1 font-medium bg-blue-50 text-blue-700 border-blue-200">
                    {agent?.callerid}
                  </Badge>
                  <Dialog open={isEditingCallerID} onOpenChange={setIsEditingCallerID}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-blue-100"
                        onClick={() => {
                          setNewCallerID(agent?.callerid || '');
                          setIsEditingCallerID(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <Phone className="h-5 w-5 text-blue-600" />
                          Editar CallerID
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <label htmlFor="callerid" className="text-sm font-medium text-gray-700">
                            Novo CallerID
                          </label>
                          <div className="relative">
                            <Input
                              id="callerid"
                              value={newCallerID}
                              onChange={(e) => {
                                const cleaned = cleanPhoneNumber(e.target.value);
                                setNewCallerID(cleaned);
                              }}
                              placeholder="Ex: 11999999999"
                              className="pr-10"
                              maxLength={11}
                            />
                            <Phone className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                          </div>
                          <div className="space-y-1">
                            <div className="rounded-md bg-blue-50 p-3">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <AlertCircle className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-blue-800">
                                    Formato do número
                                  </h3>
                                  <div className="mt-2 text-sm text-blue-700">
                                    <ul className="list-disc space-y-1 pl-5">
                                      <li>Use apenas números</li>
                                      <li>Não inclua o código do país (55)</li>
                                      <li>Não use espaços ou caracteres especiais</li>
                                      <li>Formato correto: DDD + Número</li>
                                      <li>Exemplo: 11999999999</li>
                                    </ul>
                                    <div className="mt-3 flex items-center gap-2 text-blue-600 border-t border-blue-100 pt-3">
                                      <Clock className="h-4 w-4" />
                                      <span>Pode levar até 5 segundos para atualizar</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditingCallerID(false)}
                            className="min-w-[100px]"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={async () => {
                              if (!agent) return;
                              
                              const cleaned = cleanPhoneNumber(newCallerID);
                              if (!isValidPhoneNumber(cleaned)) {
                                toast.error('Formato de número inválido. Use apenas números, sem código do país.');
                                return;
                              }
                              
                              setIsUpdatingCallerID(true);
                              
                              try {
                                // Atualiza no banco de dados
                                const { success, error } = await updateAgentCallerID(agent.id, cleaned);
                                
                                if (success) {
                                  // Atualiza o estado local
                                  setAgent({
                                    ...agent,
                                    callerid: cleaned
                                  });
                                  
                                  // Atualiza o localStorage
                                  const storedAgent = localStorage.getItem('agent');
                                  if (storedAgent) {
                                    const parsedAgent = JSON.parse(storedAgent);
                                    localStorage.setItem('agent', JSON.stringify({
                                      ...parsedAgent,
                                      callerid: cleaned
                                    }));
                                  }

                                  toast.success('CallerID atualizado com sucesso!');
                                  setIsEditingCallerID(false);
                                } else {
                                  toast.error(error || 'Erro ao atualizar CallerID');
                                }
                              } catch (err) {
                                toast.error('Erro inesperado ao atualizar CallerID');
                                console.error('Erro ao atualizar CallerID:', err);
                              } finally {
                                setIsUpdatingCallerID(false);
                              }
                            }}
                            disabled={isUpdatingCallerID || !newCallerID.trim()}
                            className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
                          >
                            {isUpdatingCallerID ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Phone className="mr-2 h-4 w-4" />
                                Salvar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={() => handleStatusChange('available')}
                disabled={status === 'available'}
                className={`min-w-[120px] transition-all duration-200 ${getStatusButtonClass('available', status)}`}
              >
                <UserCheck className="mr-2 h-5 w-5" />
                Disponível
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleStatusChange('busy')}
                disabled={status === 'busy'}
                className={`min-w-[120px] transition-all duration-200 ${getStatusButtonClass('busy', status)}`}
              >
                <PhoneOff className="mr-2 h-5 w-5" />
                Ocupado
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleStatusChange('pause')}
                disabled={status === 'pause'}
                className={`min-w-[120px] transition-all duration-200 ${getStatusButtonClass('pause', status)}`}
              >
                <Coffee className="mr-2 h-5 w-5" />
                Pausa
              </Button>
            </div>
          </div>
        </Card>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total de Chamadas"
            value={stats.totalCalls}
            icon={PhoneCall}
            description="Chamadas realizadas hoje"
            loading={historyLoading}
          />
          <StatCard
            title="Média de Duração"
            value={`${stats.averageMinutes} min`}
            icon={Timer}
            description="Tempo médio por chamada"
            loading={historyLoading}
          />
          <StatCard
            title="Taxa de Sucesso"
            value={`${stats.successRate}%`}
            icon={BarChart}
            description="Chamadas atendidas com sucesso"
            loading={historyLoading}
            trend={stats.successRate > 0 ? {
              value: stats.successRate,
              label: "de atendimento"
            } : undefined}
          />
        </div>

        {/* Chamadas Ativas */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5 text-purple-600" />
              Chamadas Ativas
            </h3>
            <div className="flex items-center gap-2">
              {callsLoading && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Atualizando...
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.promise(
                    async () => {
                      await new Promise(resolve => setTimeout(resolve, 300)); // Pequeno delay para feedback visual
                      return refetch();
                    },
                    {
                      loading: 'Atualizando chamadas...',
                      success: 'Chamadas atualizadas!',
                      error: 'Erro ao atualizar chamadas'
                    }
                  );
                }}
                className="relative"
                disabled={callsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${callsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {callsError ? (
            <div className="text-center py-4 text-red-600">
              Erro ao carregar chamadas ativas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 px-4 text-left font-medium text-gray-500">CallerID</th>
                    <th className="pb-2 px-4 text-left font-medium text-gray-500">Ramal</th>
                    <th className="pb-2 px-4 text-left font-medium text-gray-500">Destino</th>
                    <th className="pb-2 px-4 text-left font-medium text-gray-500">Status</th>
                    <th className="pb-2 px-4 text-left font-medium text-gray-500">Duração</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCalls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        <Phone className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Nenhuma chamada ativa no momento</p>
                      </td>
                    </tr>
                  ) : (
                    activeCalls.map((call) => (
                      <ActiveCallRow 
                        key={call.Channel} 
                        call={call} 
                        formatDuration={formatDuration} 
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Atualização automática a cada 5 segundos
          </div>
        </Card>

        {/* Histórico de Chamadas */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-purple-600" />
              Histórico de Chamadas
            </h3>
            <div className="flex items-center gap-2">
              {historyLoading && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Atualizando...
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.promise(
                    async () => {
                      await new Promise(resolve => setTimeout(resolve, 300));
                      return refetchHistory();
                    },
                    {
                      loading: 'Atualizando histórico...',
                      success: 'Histórico atualizado!',
                      error: 'Erro ao atualizar histórico'
                    }
                  );
                }}
                className="relative"
                disabled={historyLoading}
              >
                <RefreshCw className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {historyError ? (
            <div className="text-center py-4 text-red-600">
              Erro ao carregar histórico de chamadas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 px-4 text-left font-medium text-gray-500">Data/Hora</th>
                    <th className="pb-2 px-4 text-left font-medium text-gray-500">CallerID</th>
                    <th className="pb-2 px-4 text-left font-medium text-gray-500">Destino</th>
                    <th className="pb-2 px-4 text-left font-medium text-gray-500">Status</th>
                    <th className="pb-2 px-4 text-left font-medium text-gray-500">Duração</th>
                  </tr>
                </thead>
                <tbody>
                  {!historyCalls ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        <Loader2 className="h-12 w-12 mx-auto mb-2 text-gray-400 animate-spin" />
                        <p>Carregando histórico...</p>
                      </td>
                    </tr>
                  ) : historyCalls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        <History className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Nenhuma chamada registrada hoje</p>
                      </td>
                    </tr>
                  ) : (
                    historyCalls.map((call) => {
                      const date = new Date(call.start);
                      const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(date);

                      return (
                        <tr
                          key={call.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4">{formattedDate}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span>{agent?.callerid || 'Não configurado'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{call.dst}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                call.disposition === 'ANSWERED'
                                  ? 'bg-green-100 text-green-700'
                                  : call.disposition === 'NO ANSWER'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }
                            >
                              {call.disposition === 'ANSWERED' ? 'Atendida' :
                               call.disposition === 'NO ANSWER' ? 'Não Atendida' :
                               call.disposition === 'BUSY' ? 'Ocupado' : 
                               call.disposition}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {formatDuration(call.billsec || 0)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
            <History className="h-3 w-3" />
            Mostrando últimas 10 chamadas de hoje
          </div>
        </Card>

        {/* Grid de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chamadas Ativas</p>
                <h3 className="text-2xl font-bold text-gray-900">{activeCalls.length}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tempo em Chamada</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {activeCalls.length > 0
                    ? formatDuration(
                        Math.max(...activeCalls.map(call => parseInt(call.Duration))).toString()
                      )
                    : '0:00'}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PhoneForwarded className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {status === 'available' ? 'Disponível' : 
                   status === 'busy' ? 'Ocupado' : 
                   status === 'pause' ? 'Em Pausa' : 'Offline'}
                </h3>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AgentLayout>
  );
}
