import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, MoreVertical, Pencil, Trash2, Power, HelpCircle, RefreshCw, X } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { useQueuesRealtime } from '../hooks/useQueuesRealtime';
import { useExtensions } from '../hooks/useExtensions';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { Dialog } from '@headlessui/react';

// Componente para o menu de ações
interface ActionMenuProps {
  queue: QueueData;
  onStatusChange: (queueId: string, newStatus: QueueData['status']) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ queue, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useClickOutside(() => setIsOpen(false));

  const handleStatusChange = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = queue.status === 'active' ? 'inactive' : 'active';
    await onStatusChange(queue.id, newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Menu de ações"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 mt-1 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-1">
          <button 
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              // Lógica de edição aqui
            }}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          <button 
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
            onClick={handleStatusChange}
          >
            <Power className="h-4 w-4" />
            {queue.status === 'active' ? 'Desativar' : 'Ativar'}
          </button>
          <button 
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              // Lógica de exclusão aqui
            }}
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      )}
    </div>
  );
};

// Componente para exibir os ramais com tooltip
interface ExtensionsDisplayProps {
  extensions: string | string[];
}

const ExtensionsDisplay: React.FC<ExtensionsDisplayProps> = ({ extensions }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const displayedExtensions = Array.isArray(extensions) 
    ? extensions.slice(0, 3) 
    : extensions.split(',').slice(0, 3);
  const hasMoreExtensions = Array.isArray(extensions) 
    ? extensions.length > 3 
    : extensions.split(',').length > 3;

  return (
    <div className="flex items-center gap-2 relative">
      <span className="text-sm text-gray-600">
        {displayedExtensions.join(', ')}
        {hasMoreExtensions && '...'}
      </span>
      {hasMoreExtensions && (
        <div className="relative">
          <HelpCircle
            className="h-4 w-4 text-gray-400 cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              <div className="bg-gray-800 text-white text-sm rounded-lg py-2 px-3 shadow-lg">
                <div className="whitespace-nowrap">
                  {Array.isArray(extensions) ? extensions.join(', ') : extensions}
                </div>
                <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para o status badge
const StatusBadge: React.FC<{ status: QueueData['status'] }> = ({ status }) => {
  const statusConfig = {
    active: {
      color: 'bg-green-100 text-green-800',
      label: 'Ativo'
    },
    inactive: {
      color: 'bg-gray-100 text-gray-800',
      label: 'Inativo'
    },
    paused: {
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Pausado'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${config.color.replace('100', '400')}`}></span>
      {config.label}
    </span>
  );
};

interface CreateQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateQueueModal: React.FC<CreateQueueModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { data: extensions = [], isLoading: loadingExtensions } = useExtensions();
  const [formData, setFormData] = useState({
    nome: '',
    estrategia: 'ringall',
  });
  const [selectedRamais, setSelectedRamais] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExtensionToggle = (extension: any, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedRamais(prev => {
      const isCurrentlySelected = prev.includes(extension.numero);
      if (isCurrentlySelected) {
        return prev.filter(num => num !== extension.numero);
      } else {
        return [...prev, extension.numero];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.accountid || selectedRamais.length === 0) return;

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('queues')
        .insert([
          {
            nome: formData.nome,
            estrategia: formData.estrategia,
            ramais: selectedRamais.join(','),
            accountid: user.accountid,
            status: 'Ativo',
            created_at: now
          }
        ]);

      if (error) throw error;

      toast.success('Fila criada com sucesso!');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error creating queue:', err);
      toast.error('Erro ao criar fila');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Criar Nova Fila
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Fila
              </label>
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="estrategia" className="block text-sm font-medium text-gray-700 mb-1">
                Estratégia
              </label>
              <input
                type="text"
                id="estrategia"
                value={formData.estrategia}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ramais
              </label>
              {loadingExtensions ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500 mx-auto"></div>
                </div>
              ) : extensions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhum ramal disponível
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto p-2">
                  {extensions.map((extension) => {
                    const isSelected = selectedRamais.includes(extension.numero);
                    
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'Online (Livre)':
                          return 'bg-green-500'; // Online - Verde
                        case 'Em Chamada':
                          return 'bg-orange-500'; // Em Chamada - Laranja
                        case 'Offline':
                          return 'bg-gray-300'; // Offline - Cinza
                        default:
                          return 'bg-gray-300';
                      }
                    };

                    const getStatusText = (status: string) => {
                      switch (status) {
                        case 'Online (Livre)':
                          return 'Disponível';
                        case 'Em Chamada':
                          return 'Em Chamada';
                        case 'Offline':
                          return 'Offline';
                        default:
                          return status || 'Offline';
                      }
                    };

                    return (
                      <div
                        key={extension.id}
                        onClick={(e) => handleExtensionToggle(extension, e)}
                        className={`flex items-center p-3 rounded-md cursor-pointer transition-colors
                          ${isSelected 
                            ? 'bg-violet-100 border border-violet-300' 
                            : 'bg-gray-50 border border-gray-200 hover:border-violet-200 hover:bg-violet-50'
                          }
                        `}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {extension.numero}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${getStatusColor(extension.snystatus)}`} />
                              <span className="text-xs text-gray-500">
                                {getStatusText(extension.snystatus)}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 mt-0.5 block">
                            {extension.nome || 'Sem nome'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedRamais.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  'Criar Fila'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

interface EditQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  queue: Queue;
}

const EditQueueModal: React.FC<EditQueueModalProps> = ({ isOpen, onClose, onSuccess, queue }) => {
  const { user } = useAuth();
  const { data: extensions = [] } = useExtensions();
  const [formData, setFormData] = useState({
    nome: queue.nome,
    estrategia: queue.estrategia,
  });

  const selectedRamaisArray = useMemo(() => {
    return queue.ramais ? queue.ramais.split(',') : [];
  }, [queue.ramais]);

  const [selectedRamais, setSelectedRamais] = useState<string[]>(selectedRamaisArray);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExtensionToggle = (extension: any, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedRamais(prev => {
      const isCurrentlySelected = prev.includes(extension.numero);
      if (isCurrentlySelected) {
        return prev.filter(num => num !== extension.numero);
      } else {
        return [...prev, extension.numero];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.accountid || selectedRamais.length === 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('queues')
        .update({
          nome: formData.nome,
          estrategia: formData.estrategia,
          ramais: selectedRamais.join(','),
        })
        .eq('id', queue.id)
        .eq('accountid', user.accountid);

      if (error) throw error;

      toast.success('Fila atualizada com sucesso!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating queue:', err);
      toast.error('Erro ao atualizar fila');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Editar Fila
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Fila
              </label>
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="estrategia" className="block text-sm font-medium text-gray-700 mb-1">
                Estratégia
              </label>
              <input
                type="text"
                id="estrategia"
                value={formData.estrategia}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ramais
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto p-2">
                {extensions.map((extension) => {
                  const isSelected = selectedRamais.includes(extension.numero);
                  return (
                    <div
                      key={extension.id}
                      onClick={(e) => handleExtensionToggle(extension, e)}
                      className={`flex items-center p-3 rounded-md cursor-pointer transition-colors
                        ${isSelected 
                          ? 'bg-violet-100 border border-violet-300' 
                          : 'bg-gray-50 border border-gray-200 hover:border-violet-200 hover:bg-violet-50'
                        }
                      `}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {extension.numero}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              extension.snystatus === 'Online (Livre)' ? 'bg-green-500' :
                              extension.snystatus === 'Em Chamada' ? 'bg-orange-500' :
                              'bg-gray-300'
                            }`} />
                            <span className="text-xs text-gray-500">
                              {extension.snystatus === 'Online (Livre)' ? 'Disponível' :
                               extension.snystatus === 'Em Chamada' ? 'Em Chamada' :
                               'Offline'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-0.5 block">
                          {extension.nome || 'Sem nome'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedRamais.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

interface Queue {
  id: string;
  nome: string;
  ramais: string | null;
  estrategia: string;
  accountid: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export const Queues = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);
  const { queues, loading, error, updateQueueStatus, refetch } = useQueuesRealtime();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (user?.accountid) {
      refetch();
    }
  }, [user?.accountid]);

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Filas de Atendimento</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visualize e gerencie suas filas de atendimento
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex space-x-3">
          <button
            onClick={handleRefresh}
            className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`-ml-1 mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Atualizar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Criar Fila
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estratégia
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ramais
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Criação
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-500"></div>
                            <span className="ml-2">Carregando...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-red-500">
                          Erro ao carregar filas: {error}
                        </td>
                      </tr>
                    ) : queues.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                          Nenhuma fila encontrada. Clique em "Criar Fila" para adicionar uma nova.
                        </td>
                      </tr>
                    ) : (
                      queues.map((queue) => (
                        <tr key={queue.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{queue.nome}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{queue.estrategia}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{queue.ramais}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              queue.status === 'Ativo'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {queue.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(queue.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => {
                                  console.log('Editing queue:', queue);
                                  setEditingQueue(queue);
                                }}
                                className="text-violet-600 hover:text-violet-700"
                                title="Editar fila"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const newStatus = queue.status === 'Ativo' ? 'Inativo' : 'Ativo';
                                    await updateQueueStatus(queue.id, newStatus);
                                    toast.success(`Fila ${newStatus.toLowerCase()} com sucesso!`);
                                  } catch (err) {
                                    console.error('Error updating queue status:', err);
                                    toast.error('Erro ao alterar status da fila');
                                  }
                                }}
                                className={`${
                                  queue.status === 'Ativo' 
                                    ? 'text-green-600 hover:text-green-700' 
                                    : 'text-gray-400 hover:text-gray-500'
                                }`}
                                title={`${queue.status === 'Ativo' ? 'Desativar' : 'Ativar'} fila`}
                              >
                                <Power className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Tem certeza que deseja excluir esta fila?')) {
                                    try {
                                      const { error } = await supabase
                                        .from('queues')
                                        .delete()
                                        .eq('id', queue.id);

                                      if (error) throw error;
                                      toast.success('Fila excluída com sucesso!');
                                      refetch();
                                    } catch (err) {
                                      console.error('Error deleting queue:', err);
                                      toast.error('Erro ao excluir fila');
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="Excluir fila"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateQueueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {editingQueue && (
        <EditQueueModal
          isOpen={!!editingQueue}
          onClose={() => setEditingQueue(null)}
          onSuccess={() => {
            setEditingQueue(null);
            refetch();
          }}
          queue={editingQueue}
        />
      )}
    </div>
  );
};
