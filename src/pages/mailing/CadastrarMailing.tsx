import React from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Search, FileUp, MoreHorizontal, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { NovoMailingModal } from '../../components/Mailing/NovoMailingModal';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Mailing {
  id: number;
  nome: string;
  quantidade: number;
  created_at: string;
}

export function CadastrarMailing() {
  const { currentUser } = useCurrentUser();
  const [mailings, setMailings] = React.useState<Mailing[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const loadMailings = async () => {
    if (!currentUser?.accountid) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mailing_manager')
        .select('*')
        .eq('accountid', currentUser.accountid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMailings(data || []);
    } catch (error) {
      console.error('Erro ao carregar mailings:', error);
      toast.error('Erro ao carregar mailings');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadMailings();
  }, [currentUser?.accountid]);

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('mailing_manager')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Mailing excluído com sucesso!');
      loadMailings();
    } catch (error) {
      console.error('Erro ao excluir mailing:', error);
      toast.error('Erro ao excluir mailing');
    }
  };

  const filteredMailings = mailings.filter(mailing =>
    mailing.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cadastro de Mailing</h1>
          <p className="text-sm text-gray-500">
            Gerencie seus mailings para campanhas
          </p>
        </div>
        <Button 
          className="w-full md:w-auto" 
          size="sm"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Mailing
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar mailing..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome Mailing</TableHead>
                <TableHead>Quantidade de Registros</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                      <span className="ml-2 text-gray-500">Carregando mailings...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMailings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'Nenhum mailing encontrado para a busca' : 'Nenhum mailing cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMailings.map((mailing) => (
                  <TableRow key={mailing.id}>
                    <TableCell>{mailing.id}</TableCell>
                    <TableCell>{mailing.nome}</TableCell>
                    <TableCell>{mailing.quantidade.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(mailing.id)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <NovoMailingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadMailings}
      />
    </div>
  );
}
