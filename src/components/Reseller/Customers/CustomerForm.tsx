import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  resellerId: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  onSubmit,
  onClose,
  resellerId,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    contact: '',
    resellerid: resellerId,
    accountid: generateAccountId(),
  });

  const generateAccountId = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `RSV${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Erro ao criar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Novo Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                Documento (CPF/CNPJ)
              </label>
              <input
                type="text"
                id="document"
                name="document"
                value={formData.document}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                Contato
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="accountid" className="block text-sm font-medium text-gray-700">
                Código da Conta
              </label>
              <input
                type="text"
                id="accountid"
                name="accountid"
                value={formData.accountid}
                readOnly
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Gerado automaticamente
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
