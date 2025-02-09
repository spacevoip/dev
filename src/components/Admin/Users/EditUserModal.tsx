import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, CreditCard, Shield, Key, Clock, Hash } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (userData: any) => void;
  user: any;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onEdit, user }) => {
  const [planos, setPlanos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contato: '',
    documento: '',
    plano: '',
    status: 'ativo',
    password: '',
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return '-';
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        contato: user.contato || '',
        documento: user.documento || '',
        plano: user.plano || '',
        status: user.status || 'ativo',
        password: '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchPlanos = async () => {
      const { data } = await supabase
        .from('planos')
        .select('*')
        .order('nome');
      
      if (data) {
        setPlanos(data);
      }
    };

    if (isOpen) {
      fetchPlanos();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: any = {
        id: user.id,
        name: formData.name,
        email: formData.email,
        contato: formData.contato,
        documento: formData.documento,
        plano: formData.plano,
        status: formData.status,
      };

      if (formData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(formData.password, salt);
        updateData.password = hashedPassword;
      }
      
      await onEdit(updateData);
      toast.success('Usuário atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
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
    readOnly = false
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
          className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 ${
            disabled || readOnly ? 'bg-gray-50 text-gray-500' : ''
          } transition duration-150 ease-in-out`}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Usuário</h2>
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
            disabled
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
          />

          <InputField
            id="accountid"
            label="Account ID"
            value={user?.accountid || '-'}
            icon={Hash}
            readOnly
          />

          <InputField
            id="password"
            label="Nova Senha (deixe em branco para manter a atual)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            icon={Key}
            placeholder="••••••••"
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
                value={formData.plano}
                onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Selecione um plano</option>
                {planos.map((plano) => (
                  <option key={plano.id} value={plano.nome}>
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

          {/* Campos não editáveis */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <InputField
              id="created_at"
              label="Data de Cadastro"
              value={formatDate(user?.created_at)}
              icon={Clock}
              readOnly
            />

            <InputField
              id="last_login"
              label="Último Acesso"
              value={formatDate(user?.last_login)}
              icon={Clock}
              readOnly
            />
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
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
