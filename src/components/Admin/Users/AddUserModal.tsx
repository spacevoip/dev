import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import type { AdminUser, Plano } from '../../../types/admin';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import { generateCNPJ } from '../../../utils/generateCNPJ';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: Omit<AdminUser, 'id' | 'last_login' | 'created_at'>) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contato: '',
    documento: '',
    plano: '',
    role: 'user' as AdminUser['role'],
    accountid: '',
    limite: 0,
  });

  const generateAccountId = () => {
    const random = Math.floor(1000 + Math.random() * 9000); // Gera número entre 1000 e 9999
    return `SPCVOIP${random}`;
  };

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        const { data, error } = await supabase.from('planos').select('*');
        if (error) throw error;
        setPlanos(data || []);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
      }
    };

    if (isOpen) {
      fetchPlanos();
      // Gera um novo accountid quando o modal é aberto
      setFormData(prev => ({
        ...prev,
        accountid: generateAccountId()
      }));
    }
  }, [isOpen]);

  const handleGenerateCNPJ = () => {
    const newCNPJ = generateCNPJ();
    setFormData(prev => ({ ...prev, documento: newCNPJ }));
  };

  const handlePlanoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlano = planos.find(p => p.id === e.target.value);
    if (selectedPlano) {
      setFormData(prev => ({
        ...prev,
        plano: selectedPlano.nome,
        accountid: selectedPlano.accountid,
        limite: selectedPlano.limite,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(formData.password, salt);
    
    onAdd({
      ...formData,
      password: hashedPassword
    });
    setFormData({
      name: '',
      email: '',
      contato: '',
      documento: '',
      plano: '',
      role: 'user',
      accountid: '',
      limite: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="mx-auto max-w-lg w-full bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-lg font-semibold">
              Adicionar Novo Usuário
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
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
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="contato" className="block text-sm font-medium text-gray-700">
                Telefone/WhatsApp
              </label>
              <input
                type="text"
                id="contato"
                name="contato"
                value={formData.contato}
                onChange={(e) => setFormData(prev => ({ ...prev, contato: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="documento" className="block text-sm font-medium text-gray-700">
                CPF/CNPJ
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  id="documento"
                  name="documento"
                  value={formData.documento}
                  onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleGenerateCNPJ}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Gerar CNPJ"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="plano" className="block text-sm font-medium text-gray-700">
                Plano
              </label>
              <select
                id="plano"
                name="plano"
                required
                value={planos.find(p => p.nome === formData.plano)?.id || ''}
                onChange={handlePlanoChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Selecione um plano</option>
                {planos.map(plano => (
                  <option key={plano.id} value={plano.id}>
                    {plano.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="accountid" className="block text-sm font-medium text-gray-700">
                Account ID
              </label>
              <input
                type="text"
                id="accountid"
                name="accountid"
                required
                value={formData.accountid}
                readOnly
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="limite" className="block text-sm font-medium text-gray-700">
                Limite
              </label>
              <input
                type="number"
                id="limite"
                name="limite"
                required
                min="0"
                value={formData.limite}
                readOnly
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
