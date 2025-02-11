import { useEffect, useState, useCallback, useRef } from "react";
import { useAdminSupabaseQuery } from "../../hooks/useAdminSupabaseQuery";
import { Badge } from "../../components/ui/badge";
import { Loader2, Search, ChevronLeft, ChevronRight, Phone, PhoneCall, PhoneOff, Users, RefreshCw, Trash2, Edit } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { supabase } from '../../lib/supabase';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { toast } from 'sonner';

interface Extension {
  id: string;
  numero: string;
  nome: string;
  callerid: string;
  snystatus: string | null;
  username: string | null;
}

interface StatsCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  status: string | null;
}

const ITEMS_PER_PAGE = 20;
const UPDATE_INTERVAL = 5000; // 5 segundos

export function AdminExtensions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
  const [extensionToDelete, setExtensionToDelete] = useState<Extension | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [extensionToEdit, setExtensionToEdit] = useState<Extension | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    callerid: "",
    username: ""
  });
  const backgroundUpdateRef = useRef<NodeJS.Timeout>();
  
  const { data: extensions, loading, error, refetch } = useAdminSupabaseQuery<Extension>({
    table: "extensions",
    orderBy: "numero",
  });

  // Mantém o estado anterior durante o carregamento
  const [stableExtensions, setStableExtensions] = useState<Extension[]>([]);
  
  // Atualiza o estado estável apenas quando temos novos dados
  useEffect(() => {
    if (extensions && !loading) {
      setStableExtensions(extensions);
    }
  }, [extensions, loading]);

  // Função de atualização em segundo plano
  const backgroundUpdate = useCallback(async () => {
    try {
      await refetch();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro na atualização em segundo plano:', error);
    }
  }, [refetch]);

  // Configura a atualização em segundo plano
  useEffect(() => {
    backgroundUpdateRef.current = setInterval(backgroundUpdate, UPDATE_INTERVAL);
    return () => {
      if (backgroundUpdateRef.current) {
        clearInterval(backgroundUpdateRef.current);
      }
    };
  }, [backgroundUpdate]);

  // Função de refresh manual com animação
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  // Função auxiliar para verificar status
  const getExtensionStatus = (status: string | null | undefined) => {
    if (!status) return 'offline';
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('online')) return 'online';
    if (statusLower.includes('inuse') || statusLower.includes('incall') || statusLower.includes('em chamada')) return 'incall';
    if (statusLower.includes('offline')) return 'offline';
    return 'offline';
  };

  // Função para deletar um ramal
  const handleDelete = async (extension: Extension) => {
    setExtensionToDelete(extension);
    setShowDeleteDialog(true);
  };

  // Função para confirmar a deleção
  const confirmDelete = async () => {
    if (extensionToDelete) {
      try {
        const { error } = await supabase
          .from('extensions')
          .delete()
          .eq('id', extensionToDelete.id);

        if (error) throw error;
        
        await refetch();
        setShowDeleteDialog(false);
        setExtensionToDelete(null);
      } catch (error) {
        console.error('Erro ao deletar ramal:', error);
      }
    }
  };

  // Função para deletar múltiplos ramais
  const handleBulkDelete = async () => {
    setShowBulkDeleteDialog(true);
  };

  // Função para confirmar deleção em massa
  const confirmBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('extensions')
        .delete()
        .in('id', selectedExtensions);

      if (error) throw error;
      
      await refetch();
      setShowBulkDeleteDialog(false);
      setSelectedExtensions([]);
    } catch (error) {
      console.error('Erro ao deletar ramais:', error);
    }
  };

  // Função para selecionar/deselecionar todos
  const toggleSelectAll = () => {
    if (selectedExtensions.length === filteredExtensions?.length) {
      setSelectedExtensions([]);
    } else {
      setSelectedExtensions(filteredExtensions?.map(ext => ext.id) || []);
    }
  };

  // Função para alternar seleção individual
  const toggleExtension = (id: string) => {
    setSelectedExtensions(prev => 
      prev.includes(id) 
        ? prev.filter(extId => extId !== id)
        : [...prev, id]
    );
  };

  // Função para abrir o modal de edição
  const handleEdit = (extension: Extension) => {
    setExtensionToEdit(extension);
    setEditForm({
      nome: extension.nome || "",
      callerid: extension.callerid || "",
      username: extension.username || ""
    });
    setShowEditDialog(true);
  };

  // Função para salvar as alterações
  const handleSaveEdit = async () => {
    if (!extensionToEdit) return;

    try {
      const { error } = await supabase
        .from('extensions')
        .update({
          nome: editForm.nome,
          callerid: editForm.callerid,
          username: editForm.username
        })
        .eq('id', extensionToEdit.id);

      if (error) throw error;

      await refetch();
      setShowEditDialog(false);
      setExtensionToEdit(null);
      toast.success('Ramal atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar ramal:', error);
      toast.error('Erro ao atualizar ramal');
    }
  };

  // Calcular estatísticas
  const stats: StatsCard[] = [
    {
      title: "Total de Ramais",
      value: stableExtensions?.length || 0,
      icon: <Users className="h-4 w-4" />,
      color: "text-blue-600",
      status: null
    },
    {
      title: "Ramais Online",
      value: stableExtensions?.filter(ext => getExtensionStatus(ext.snystatus) === 'online').length || 0,
      icon: <Phone className="h-4 w-4" />,
      color: "text-green-600",
      status: 'online'
    },
    {
      title: "Em Chamada",
      value: stableExtensions?.filter(ext => getExtensionStatus(ext.snystatus) === 'incall').length || 0,
      icon: <PhoneCall className="h-4 w-4" />,
      color: "text-yellow-600",
      status: 'incall'
    },
    {
      title: "Offline",
      value: stableExtensions?.filter(ext => getExtensionStatus(ext.snystatus) === 'offline').length || 0,
      icon: <PhoneOff className="h-4 w-4" />,
      color: "text-gray-600",
      status: 'offline'
    }
  ];

  // Filtrar extensões baseado na pesquisa e status
  const filteredExtensions = stableExtensions?.filter(ext => {
    const matchesSearch = 
      ext.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ext.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ext.callerid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ext.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter 
      ? getExtensionStatus(ext.snystatus) === statusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  // Calcular páginas
  const totalPages = Math.ceil((filteredExtensions?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExtensions = filteredExtensions?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset página quando mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Loading inicial
  if (loading && stableExtensions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Erro ao carregar extensões: {error}
        </div>
      </div>
    );
  }

  if (!stableExtensions || stableExtensions.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
          Nenhuma extensão encontrada.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com título, pesquisa e refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Extensões</h1>
            <p className="text-sm text-gray-500 mt-1">
              Última atualização: {lastUpdate.toLocaleTimeString()}
              {statusFilter && (
                <span className="ml-2">
                  | Filtro: {stats.find(s => s.status === statusFilter)?.title}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter(null)}
                    className="ml-2 h-6 px-2 text-xs"
                  >
                    Limpar
                  </Button>
                </span>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className={`ml-2 ${isRefreshing ? 'opacity-50' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="relative w-full sm:w-auto min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Pesquisar por ramal, agente ou caller ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`border border-gray-200 cursor-pointer transition-all hover:shadow-md ${
              statusFilter === stat.status ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setStatusFilter(stat.status)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela de Extensões */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedExtensions.length === filteredExtensions?.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                    Ramal
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Agente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Caller ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedExtensions?.map((extension) => {
                let statusColor = 'bg-gray-500';
                let statusText = extension.snystatus || 'Offline';
                
                switch (getExtensionStatus(extension.snystatus)) {
                  case 'online':
                    statusColor = 'bg-green-500';
                    break;
                  case 'incall':
                    statusColor = 'bg-yellow-500';
                    break;
                  case 'offline':
                    statusColor = 'bg-gray-500';
                    statusText = 'Offline';
                    break;
                }

                return (
                  <tr key={extension.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedExtensions.includes(extension.id)}
                          onChange={() => toggleExtension(extension.id)}
                          className="rounded border-gray-300"
                        />
                        {extension.numero}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {extension.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {extension.username || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {extension.callerid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${statusColor} text-white font-medium`}>
                        {statusText}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(extension)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(extension)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
              <span className="font-medium">
                {Math.min((currentPage) * ITEMS_PER_PAGE, filteredExtensions?.length || 0)}
              </span>{" "}
              de{" "}
              <span className="font-medium">{filteredExtensions?.length}</span> resultados
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-gray-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-gray-600"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação de Deleção */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o ramal {extensionToDelete?.numero}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Deleção em Massa */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedExtensions.length} ramais selecionados?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmBulkDelete}
            >
              Excluir Selecionados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ramal {extensionToEdit?.numero}</DialogTitle>
            <DialogDescription>
              Atualize as informações do ramal. O número do ramal não pode ser alterado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Agente</Label>
              <Input
                id="nome"
                value={editForm.nome}
                onChange={(e) => setEditForm(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do agente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="callerid">Caller ID</Label>
              <Input
                id="callerid"
                value={editForm.callerid}
                onChange={(e) => setEditForm(prev => ({ ...prev, callerid: e.target.value }))}
                placeholder="Caller ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Cliente</Label>
              <Input
                id="username"
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Nome do cliente"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
