import React, { useState, useRef, useEffect } from 'react';
import { Construction, Plus, X, Play, Square, Pause, Trash2, RotateCcw, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Queue {
  id: string;
  nome: string;
  accountid: string;
  ramais: string;
}

interface Extension {
  id: string;
  nome: string;
  numero: string;
  callerid: string;
  accountid: string;
}

interface SipAutoForm {
  nome: string;
  ramalSaida: string;
  fila: string;
  ramaisAtendimento: string[];
  arquivo: File | null;
  quantidadeNumeros: number;
}

interface SipAutoData {
  id: string;
  nome: string;
  ramalin: string;
  ramalout: string;
  status: 'Inativa' | 'Em Andamento' | 'Pausa' | 'Concluido';
  qnttotal: number;
  numerosdiscados: number;
  filanome: string;
}

export const SipAuto = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [sipAutoData, setSipAutoData] = useState<SipAutoData[]>([]);
  const [formData, setFormData] = useState<SipAutoForm>({
    nome: '',
    ramalSaida: '',
    fila: '',
    ramaisAtendimento: [],
    arquivo: null,
    quantidadeNumeros: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buscar filas do cliente
  useEffect(() => {
    const fetchQueues = async () => {
      if (user?.accountid) {
        const { data, error } = await supabase
          .from('queues')
          .select('id, nome, ramais')
          .eq('accountid', user.accountid);

        if (error) {
          console.error('Erro ao buscar filas:', error);
          return;
        }

        if (data) {
          setQueues(data);
        }
      }
    };

    const fetchExtensions = async () => {
      if (user?.accountid) {
        const { data, error } = await supabase
          .from('extensions')
          .select('id, nome, numero, callerid')
          .eq('accountid', user.accountid);

        if (error) {
          console.error('Erro ao buscar ramais:', error);
          return;
        }

        if (data) {
          setExtensions(data);
        }
      }
    };

    const fetchSipAutoData = async () => {
      if (user?.accountid) {
        const { data, error } = await supabase
          .from('sipauto')
          .select('*')
          .eq('accountid', user.accountid);

        if (error) {
          console.error('Erro ao buscar dados do SipAuto:', error);
          return;
        }

        if (data) {
          setSipAutoData(data);
        }
      }
    };

    fetchQueues();
    fetchExtensions();
    fetchSipAutoData();
  }, [user?.accountid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'fila') {
      const selectedQueue = queues.find(q => q.nome === value);
      setSelectedQueue(selectedQueue || null);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ramaisAtendimento: selectedQueue?.ramais ? selectedQueue.ramais.split(',').map(r => r.trim()) : []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const numeros = text.split(',').filter(num => num.trim() !== '').length;
        setFormData(prev => ({
          ...prev,
          arquivo: file,
          quantidadeNumeros: numeros
        }));
      };
      reader.readAsText(file);
    } else {
      alert('Por favor, selecione um arquivo .txt');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      ramalSaida: '',
      fila: '',
      ramaisAtendimento: [],
      arquivo: null,
      quantidadeNumeros: 0
    });
    setSelectedQueue(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.accountid) {
      console.error('Usuário não identificado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('sipauto')
        .insert([
          {
            nome: formData.nome,
            ramalin: formData.ramalSaida,
            ramalout: formData.ramaisAtendimento.join(','),
            status: 'Inativa',
            qnttotal: formData.quantidadeNumeros,
            numerosdiscados: 0,
            accountid: user.accountid,
            filanome: formData.fila
          }
        ])
        .select();

      if (error) {
        console.error('Erro ao salvar:', error);
        return;
      }

      // Atualiza a lista
      const { data: updatedData } = await supabase
        .from('sipauto')
        .select('*')
        .eq('accountid', user.accountid);

      if (updatedData) {
        setSipAutoData(updatedData);
      }

      handleClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Em Andamento':
        return 'bg-green-100 text-green-800';
      case 'Pausa':
        return 'bg-orange-100 text-orange-800';
      case 'Concluido':
        return 'bg-blue-100 text-blue-800';
      default: // Inativa
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('sipauto')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        return;
      }

      // Atualiza a lista
      const { data } = await supabase
        .from('sipauto')
        .select('*')
        .eq('accountid', user?.accountid);

      if (data) {
        setSipAutoData(data);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleRestart = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sipauto')
        .update({ 
          numerosdiscados: 0,
          status: 'Inativa'
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao reiniciar campanha:', error);
        return;
      }

      // Atualiza a lista
      const { data } = await supabase
        .from('sipauto')
        .select('*')
        .eq('accountid', user?.accountid);

      if (data) {
        setSipAutoData(data);
      }
    } catch (error) {
      console.error('Erro ao reiniciar campanha:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sipauto')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir:', error);
        return;
      }

      setSipAutoData(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Construction className="h-6 w-6 text-yellow-400 mr-3" />
            <p className="text-yellow-700">
              Esta Página está ainda sendo Criada. Aguarde
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SIP Auto Diall</h1>
            <p className="text-gray-600">Sistema de Chamadas Automáticas</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Criar
          </Button>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ramal de Entrada
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fila
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ramais
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Números Discados
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sipAutoData.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.ramalin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.filanome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.ramalout}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.qnttotal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.numerosdiscados} / {item.qnttotal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(item.id, 'Em Andamento')}
                            className="text-green-600 hover:text-green-700 cursor-pointer"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            <span>Iniciar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(item.id, 'Pausa')}
                            className="text-orange-600 hover:text-orange-700 cursor-pointer"
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            <span>Pausar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(item.id, 'Concluido')}
                            className="text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            <Square className="mr-2 h-4 w-4" />
                            <span>Parar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRestart(item.id)}
                            className="text-indigo-600 hover:text-indigo-700 cursor-pointer"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            <span>Reiniciar Campanha</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Nova Configuração</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Nome da configuração"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ramal Saída</label>
                    <select
                      id="ramalSaida"
                      name="ramalSaida"
                      value={formData.ramalSaida}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione um ramal</option>
                      {extensions.map((extension) => (
                        <option key={extension.id} value={extension.numero}>
                          Ramal: ({extension.numero}) Agente: {extension.nome} Bina: {extension.callerid || 'Não definida'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fila</label>
                    <select
                      id="fila"
                      name="fila"
                      value={formData.fila}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione uma fila</option>
                      {queues.map((queue) => (
                        <option key={queue.id} value={queue.nome}>
                          {queue.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ramais de Atendimento na Fila
                    </label>
                    <div className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm min-h-[38px]">
                      {formData.ramaisAtendimento.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.ramaisAtendimento.map((ramal, index) => (
                            <span 
                              key={index}
                              className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded"
                            >
                              {ramal}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">Selecione uma fila para ver os ramais</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload de Números (.txt)
                    </label>
                    <div className="mt-1 flex items-center gap-4">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        className="w-full"
                      />
                      {formData.arquivo && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Total de números:</span>
                          <span className="font-medium">{formData.quantidadeNumeros}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button"
                    onClick={handleClose}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
