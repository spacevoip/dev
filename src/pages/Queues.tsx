import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, MoreVertical, Pencil, Trash2, Power, HelpCircle, RefreshCw, X } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { useQueues, QueueData } from '../hooks/useQueues';
import { toast } from 'react-hot-toast';
import { useExtensions } from '../hooks/useExtensions';
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
  const { extensions, loading: loadingExtensions, error: extensionsError } = useExtensions();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Criar Nova Fila</h2>
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
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
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
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3">
                  {extensions.map((extension) => {
                    console.log('Extension data:', extension); // Debug log
                    const isSelected = selectedRamais.includes(extension.numero);
                    return (
                      <div
                        key={extension.id}
                        onClick={(e) => handleExtensionToggle(extension, e)}
                        className={`
                          relative p-3 rounded-lg cursor-pointer select-none transition-all duration-200
                          ${isSelected 
                            ? 'bg-violet-50 border-2 border-violet-500 shadow-sm' 
                            : 'bg-gray-50 border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-base font-medium text-gray-900">
                            {extension.numero} <span className="text-gray-500">({extension.nome})</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {extensions.length === 0 && (
                    <div className="col-span-2 p-4 text-sm text-gray-500 text-center bg-gray-50 rounded-lg">
                      Nenhum ramal encontrado
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loadingExtensions || selectedRamais.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors ${
                  isSubmitting || loadingExtensions || selectedRamais.length === 0
                    ? 'bg-violet-400 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Criando...
                  </div>
                ) : (
                  'Criar Fila'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
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

interface EditQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  queue: Queue;
}

const EditQueueModal: React.FC<EditQueueModalProps> = ({ isOpen, onClose, onSuccess, queue }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { extensions } = useExtensions();
  const [queueName, setQueueName] = useState(queue.nome);

  // Pega os ramais da fila atual
  const [queueRamais, setQueueRamais] = useState<string[]>(() => {
    try {
      if (!queue.ramais) return [];
      if (typeof queue.ramais !== 'string') {
        console.error('Queue ramais is not a string:', queue.ramais);
        return [];
      }
      return queue.ramais.split(',').map(r => r.trim()).filter(Boolean);
    } catch (error) {
      console.error('Error parsing queue ramais:', error);
      return [];
    }
  });

  // Debug logs
  useEffect(() => {
    console.log('Queue data:', queue);
    console.log('Queue ramais:', queue.ramais);
    console.log('Queue ramais type:', typeof queue.ramais);
    console.log('Parsed queue ramais:', queueRamais);
  }, [queue, queueRamais]);

  // Filtra os ramais disponíveis (que não estão na fila)
  const availableExtensions = useMemo(() => {
    return extensions.filter(ext => !queueRamais.includes(ext.numero));
  }, [extensions, queueRamais]);

  // Mostra os ramais que estão na fila
  const queueExtensions = useMemo(() => {
    return extensions.filter(ext => queueRamais.includes(ext.numero));
  }, [extensions, queueRamais]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queueName.trim()) {
      toast.error('O nome da fila é obrigatório');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('queues')
        .update({
          nome: queueName.trim(),
          ramais: queueRamais.join(',')
        })
        .eq('id', queue.id);

      if (error) throw error;

      toast.success('Fila atualizada com sucesso!');
      onSuccess();
    } catch (err) {
      console.error('Error updating queue:', err);
      toast.error('Erro ao atualizar fila');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-xl bg-white shadow-2xl">
          <div className="p-6">
            <div className="border-b border-gray-100 pb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Editar Fila
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-gray-500">
                Configure os detalhes e ramais desta fila de atendimento.
              </Dialog.Description>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Nome da Fila */}
              <div>
                <label htmlFor="queueName" className="block text-sm font-medium text-gray-700">
                  Nome da Fila
                </label>
                <input
                  type="text"
                  id="queueName"
                  value={queueName}
                  onChange={(e) => setQueueName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="Digite o nome da fila"
                />
              </div>

              {/* Grid de Ramais */}
              <div className="grid grid-cols-2 gap-6">
                {/* Ramais na fila */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ramais na Fila
                  </label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="divide-y divide-gray-100">
                      {queueExtensions.map((ext) => (
                        <div
                          key={ext.numero}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                              <span className="text-sm font-medium text-violet-700">{ext.numero.slice(0, 2)}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{ext.numero}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setQueueRamais(current =>
                                current.filter(r => r !== ext.numero)
                              );
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {queueExtensions.length === 0 && (
                        <div className="p-8 text-center">
                          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Power className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum ramal adicionado</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Adicione ramais da lista ao lado para começar.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ramais disponíveis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ramais Disponíveis
                  </label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="divide-y divide-gray-100">
                      {availableExtensions.map((ext) => (
                        <button
                          key={ext.numero}
                          type="button"
                          onClick={() => {
                            setQueueRamais(current => [...current, ext.numero]);
                          }}
                          className="flex items-center justify-between w-full p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                              <span className="text-sm font-medium text-gray-700">{ext.numero.slice(0, 2)}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{ext.numero}</span>
                          </div>
                          <Plus className="h-4 w-4 text-gray-400" />
                        </button>
                      ))}
                      {availableExtensions.length === 0 && (
                        <div className="p-8 text-center">
                          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Power className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum ramal disponível</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Todos os ramais já foram adicionados.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !queueName.trim()}
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-lg shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors ${
                    isSubmitting || !queueName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export const Queues = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);
  const { queues, loading, error, updateQueueStatus, refetch } = useQueues();

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
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-400 cursor-not-allowed"
            disabled={true}
            title="Em Breve"
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
                                    const { error } = await supabase
                                      .from('queues')
                                      .update({ status: newStatus })
                                      .eq('id', queue.id);

                                    if (error) throw error;
                                    toast.success(`Fila ${newStatus.toLowerCase()} com sucesso!`);
                                    refetch();
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
