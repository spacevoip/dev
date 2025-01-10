import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { debounce } from 'lodash';
import { supabase } from '../../../lib/supabase';
import type { Extension } from '../../../types';

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
          .eq('numero', callerID)
          .single();

        setIsBlocked(!!data);
      } catch (error) {
        console.error('Erro ao verificar CallerID:', error);
      }
    }, 500),
    []
  );

  const handleCallerIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, callerId: value }));
    checkCallerID(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        id: extension.id,
        name: formData.name,
        callerId: formData.callerId,
        ...(formData.password ? { password: formData.password } : {}),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
          required
        />
      </div>

      {/* Caller ID */}
      <div>
        <label htmlFor="callerId" className="block text-sm font-medium text-gray-700 mb-1">
          Caller ID
        </label>
        <div className="relative">
          <input
            type="text"
            id="callerId"
            value={formData.callerId}
            onChange={handleCallerIDChange}
            className={`w-full px-3 py-2 border rounded-lg transition-colors ${
              isBlocked
                ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            }`}
          />
          {isBlocked && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {isBlocked && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Este Caller ID está bloqueado
          </p>
        )}
      </div>

      {/* Senha */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Nova Senha (opcional)
        </label>
        <div className="relative">
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            id="password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
            placeholder="Digite para alterar a senha"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            {showCurrentPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isBlocked || loading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
            isBlocked || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-violet-600 hover:bg-violet-700'
          }`}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
};