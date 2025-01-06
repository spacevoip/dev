import React, { useState, useCallback } from 'react';
import { PasswordInput } from '../AddExtension/PasswordInput';
import type { Extension } from '../../../types';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';

interface EditExtensionFormProps {
  extension: Extension;
  onSubmit: (data: {
    id: string;
    name: string;
    callerId: string;
    password?: string;
  }) => void;
  onCancel: () => void;
}

export const EditExtensionForm: React.FC<EditExtensionFormProps> = ({
  extension,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: extension.name,
    callerId: extension.callerId || '',
    password: '',
  });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      return;
    }
    onSubmit({
      id: extension.id,
      ...formData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome
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
          Caller ID
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.callerId}
            onChange={handleCallerIDChange}
            className={`block w-full rounded-lg border px-3 py-2 focus:ring-2 transition-colors duration-200 ${
              isBlocked 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            required
          />
          <div className={`absolute -bottom-6 left-0 text-sm text-red-600 transition-opacity duration-200 ${
            isBlocked ? 'opacity-100' : 'opacity-0'
          }`}>
            Este CallerID está Bloqueado P/ Uso!
          </div>
        </div>
      </div>

      <PasswordInput
        value={formData.password}
        onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
        onGenerate={() => {}}
        optional
      />

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isBlocked}
          className={`px-4 py-2 text-white rounded-lg ${
            isBlocked 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Salvar Alterações
        </button>
      </div>
    </form>
  );
};