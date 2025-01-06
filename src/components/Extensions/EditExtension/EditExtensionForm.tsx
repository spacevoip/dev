import React, { useState } from 'react';
import { PasswordInput } from '../AddExtension/PasswordInput';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <input
          type="text"
          value={formData.callerId}
          onChange={(e) => setFormData(prev => ({ ...prev, callerId: e.target.value }))}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
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
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Salvar Alterações
        </button>
      </div>
    </form>
  );
};