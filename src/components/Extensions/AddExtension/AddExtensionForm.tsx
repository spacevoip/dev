import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { generatePassword } from '../../../utils/password';
import { RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';

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
          />
          <Button 
            type="button" 
            onClick={generateNewNumber}
            disabled={loading}
            className="flex items-center gap-2 whitespace-nowrap"
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
        <Input
          id="callerId"
          value={formData.callerId}
          onChange={(e) => setFormData(prev => ({ ...prev, callerId: e.target.value }))}
        />
      </div>

      <div>
        <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <div className="flex gap-2">
          <Input
            id="senha"
            value={formData.senha}
            onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
            required
          />
          <Button type="button" onClick={handleGeneratePassword}>
            Gerar
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Adicionar
        </Button>
      </div>
    </form>
  );
};