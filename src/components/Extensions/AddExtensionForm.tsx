import React, { useState, useEffect } from 'react';
import { generatePassword } from '../../utils/passwordGenerator';
import { PasswordInput } from './PasswordInput';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface AddExtensionFormProps {
  onSubmit: (data: {
    name: string;
    extension: string;
    callerId: string;
    senha: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    extension: string;
    callerId: string;
    senha: string;
  };
}

export const AddExtensionForm: React.FC<AddExtensionFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    extension: initialData?.extension || '',
    callerId: initialData?.callerId || '',
    senha: initialData?.senha || '',
  });

  const [loading, setLoading] = useState(false);

  const generateNewNumber = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      let newNumber;
      let exists = true;
      
      while (exists) {
        newNumber = Math.floor(1000 + Math.random() * 9000).toString();
        const { data } = await supabase
          .from('extensions')
          .select('numero')
          .eq('numero', newNumber)
          .eq('status', 'ativo')
          .single();
        exists = !!data;
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

  // Gera número ao montar o componente
  useEffect(() => {
    if (!initialData) {
      generateNewNumber();
    }
  }, [initialData]);

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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Extension Number
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={formData.extension}
              readOnly
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 pr-10"
              required
              placeholder={initialData ? '' : 'Generating...'}
            />
            <button
              type="button"
              onClick={generateNewNumber}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Caller ID
        </label>
        <input
          type="text"
          pattern="[0-9]*"
          value={formData.callerId}
          onChange={(e) => setFormData(prev => ({ ...prev, callerId: e.target.value }))}
          placeholder="Ex: 11999999999"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <PasswordInput
        value={formData.senha}
        onChange={(value) => setFormData(prev => ({ ...prev, senha: value }))}
        onGenerate={handleGeneratePassword}
      />

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {initialData ? 'Save Changes' : 'Add Extension'}
        </button>
      </div>
    </form>
  );
};
