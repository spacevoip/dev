import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../Common/Modal';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Phone, User, Hash, Key, Loader2, RefreshCw } from 'lucide-react';

const extensionSchema = z.object({
  numero: z.string()
    .min(4, 'Número deve ter 4 dígitos')
    .max(4, 'Número deve ter 4 dígitos')
    .regex(/^\d{4}$/, 'Deve conter exatamente 4 dígitos'),
  nome: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  callerid: z.string()
    .min(3, 'Caller ID deve ter no mínimo 3 caracteres'),
  senha: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(20, 'Senha deve ter no máximo 20 caracteres')
});

type ExtensionFormData = z.infer<typeof extensionSchema>;

interface AddExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountId: string;
}

export const AddExtensionModal: React.FC<AddExtensionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accountId,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ExtensionFormData>({
    resolver: zodResolver(extensionSchema),
  });

  // Função para gerar número aleatório de 4 dígitos
  const generateRandomExtension = () => {
    const min = 1000;
    const max = 9999;
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    return random.toString();
  };

  // Reseta o form e gera novo número quando o modal abre
  useEffect(() => {
    if (isOpen) {
      reset({
        numero: generateRandomExtension(),
        nome: '',
        callerid: '',
        senha: ''
      });
    }
  }, [isOpen, reset]);

  // Função para gerar novo número
  const handleGenerateNewNumber = () => {
    setValue('numero', generateRandomExtension());
  };

  const onSubmit = async (data: ExtensionFormData) => {
    try {
      const { error } = await supabase.from('extensions').insert([
        {
          ...data,
          accountid: accountId,
          contexto: 'from-internal',
          status: 'ativo',
          max_contacts: 1
        },
      ]);

      if (error) throw error;

      toast.success('Ramal adicionado com sucesso!');
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar ramal:', error);
      toast.error('Erro ao adicionar ramal');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Novo Ramal"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Número do Ramal */}
          <div className="space-y-2">
            <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
              Número do Ramal
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="numero"
                {...register('numero')}
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                readOnly
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={handleGenerateNewNumber}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  title="Gerar novo número"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>
            {errors.numero && (
              <p className="mt-1 text-sm text-red-600">{errors.numero.message}</p>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome do Usuário
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="nome"
                {...register('nome')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Ex: João Silva"
              />
            </div>
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          {/* Caller ID */}
          <div className="space-y-2">
            <label htmlFor="callerid" className="block text-sm font-medium text-gray-700">
              Caller ID (Bina)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="callerid"
                {...register('callerid')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Ex: João Silva"
              />
            </div>
            {errors.callerid && (
              <p className="mt-1 text-sm text-red-600">{errors.callerid.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="senha"
                {...register('senha')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Digite uma senha segura"
              />
            </div>
            {errors.senha && (
              <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Ramal'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
