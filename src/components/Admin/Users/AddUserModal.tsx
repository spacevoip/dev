import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, CreditCard, Shield, Key, RefreshCw } from 'lucide-react';
import type { AdminUser, Plano } from '../../../types/admin';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import { generateCNPJ } from '../../../utils/generateCNPJ';
import { toast } from 'react-hot-toast';

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
    password: '',
    status: 'ativo',
  });

  const generateAccountId = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
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
        toast.error('Erro ao carregar planos');
      }
    };

    if (isOpen) {
      fetchPlanos();
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
    
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(formData.password, salt);
      
      await onAdd({
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
        password: '',
        status: 'ativo',
      });

      toast.success('Usuário adicionado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast.error('Erro ao adicionar usuário');
    }
  };

  if (!isOpen) return null;

  const InputField = ({ 
    id, 
    label, 
    type = 'text', 
    value, 
    onChange, 
    icon: Icon,
    placeholder = '',
    required = false,
    disabled = false,
    rightElement = null
  }) => (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500 transition duration-150 ease-in-out"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Adicionar Novo Usuário</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <InputField
            id="name"
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={User}
            placeholder="Nome completo"
            required
          />

          <InputField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={Mail}
            placeholder="email@exemplo.com"
            required
          />

          <InputField
            id="contato"
            label="Telefone/WhatsApp"
            value={formData.contato}
            onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
            icon={Phone}
            placeholder="(00) 00000-0000"
          />

          <InputField
            id="documento"
            label="CPF/CNPJ"
            value={formData.documento}
            onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
            icon={CreditCard}
            placeholder="000.000.000-00"
            rightElement={
              <button
                type="button"
                onClick={handleGenerateCNPJ}
                className="px-3 py-2 text-gray-400 hover:text-gray-500"
                title="Gerar CNPJ"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            }
          />

          <InputField
            id="password"
            label="Senha"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            icon={Key}
            placeholder="••••••••"
            required
          />

          <div className="space-y-1">
            <label htmlFor="plano" className="block text-sm font-medium text-gray-700">
              Plano
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="plano"
                value={planos.find(p => p.nome === formData.plano)?.id || ''}
                onChange={handlePlanoChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Selecione um plano</option>
                {planos.map((plano) => (
                  <option key={plano.id} value={plano.id}>
                    {plano.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
