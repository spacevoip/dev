import React, { useState, useCallback } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { generatePassword } from '../../../utils/password';
import { RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import debounce from 'lodash/debounce';

interface AddExtensionFormProps {
  onSubmit: (data: {
    name: string;
    extension: string;
    callerId: string;
    senha: string;
  }) => void;
  onCancel: () => void;
}

export const AddExtensionForm: React.FC<AddExtensionFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    extension: '',
    callerId: '',
    senha: '',
  });

  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Função debounced para verificar o CallerID
  const checkCallerID = useCallback(
    debounce(async (callerID: string) => {
      if (!callerID?.trim()) {
        setIsBlocked(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('calleridblack')
          .select('*')
          .eq('callerid', callerID.trim());

        if (error) return;

        const blocked = data && data.length > 0;
        if (blocked) {
          setIsBlocked(true);
          toast.error('Este CallerID está Bloqueado P/ Uso!');
        } else {
          setIsBlocked(false);
        }
      } catch (error) {
        // Silently handle error
      }
    }, 500),
    []
  );

  const handleCallerIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCallerID = e.target.value;
    setFormData(prev => ({ ...prev, callerId: newCallerID }));
    
    // Reset o estado de bloqueio enquanto o usuário digita
    setIsBlocked(false);
    
    // Verifica após o debounce
    checkCallerID(newCallerID);
  };

  // Função para gerar número aleatório de 4 dígitos
  const generateNewNumber = async () => {
    try {
      setLoading(true);
      
      // Gera número aleatório de 4 dígitos
      const newNumber = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Verifica se já existe
      const { data: existingNumber } = await supabase
        .from('extensions')
        .select('numero')
        .eq('numero', newNumber)
        .eq('status', 'ativo')
        .single();
      
      if (existingNumber) {
        // Se existir, tenta novamente
        toast.error('Número já existe, gerando outro...');
        generateNewNumber();
        return;
      }
      
      setFormData(prev => ({ ...prev, extension: newNumber }));
      toast.success('Número gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar número:', error);
      toast.error('Erro ao gerar número do ramal');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    setFormData(prev => ({
      ...prev,
      senha: generatePassword(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label htmlFor="extension" className="block text-sm font-medium text-gray-700">
          Extension Number
        </label>
        <div className="flex gap-2">
          <Input
            id="extension"
            value={formData.extension}
            readOnly
            className="bg-gray-50 flex-1"
            placeholder="Clique em Generate para gerar um número"
            required
          />
          <Button
            type="button"
            onClick={generateNewNumber}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Generate
          </Button>
        </div>
      </div>

      <div>
        <label htmlFor="callerId" className="block text-sm font-medium text-gray-700">
          Caller ID
        </label>
        <div className="relative">
          <Input
            id="callerId"
            value={formData.callerId}
            onChange={handleCallerIDChange}
            className={`transition-colors duration-200 ${
              isBlocked 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                : ''
            }`}
            required
          />
          {isBlocked && (
            <div className="absolute -bottom-6 left-0 text-sm text-red-600">
              Este CallerID está Bloqueado P/ Uso!
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <div className="flex gap-2">
          <Input
            id="senha"
            type="text"
            value={formData.senha}
            onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
            className="flex-1"
            required
          />
          <Button
            type="button"
            onClick={handleGeneratePassword}
            variant="outline"
          >
            Generate
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isBlocked || loading}
          variant={isBlocked ? 'destructive' : 'default'}
        >
          Adicionar
        </Button>
      </div>
    </form>
  );
};