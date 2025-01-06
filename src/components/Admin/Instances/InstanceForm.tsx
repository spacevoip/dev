import React, { useState } from 'react';
import { X } from 'lucide-react';

interface InstanceFormProps {
  onSubmit: (data: {
    name: string;
    domain: string;
    extensionsLimit: number;
  }) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const InstanceForm: React.FC<InstanceFormProps> = ({
  onSubmit,
  onClose,
  isOpen,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    extensionsLimit: 10,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create New Instance</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instance Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
              <span className="ml-2 text-gray-500">.pabx.com</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extensions Limit
            </label>
            <input
              type="number"
              min="5"
              max="1000"
              value={formData.extensionsLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, extensionsLimit: parseInt(e.target.value) }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Instance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};