import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { AdminUser } from '../../../pages/admin/Users';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface Plan {
  id: string;
  nome: string;
  validade: number;
}

interface UserEditModalProps {
  user: AdminUser;
  onClose: () => void;
  onUpdate: (updatedUser: Partial<AdminUser>) => Promise<void>;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ 
  user, 
  onClose, 
  onUpdate 
}) => {
  const [editedUser, setEditedUser] = useState<Partial<AdminUser>>({
    name: user.name,
    email: user.email,
    plano: user.plano,
    status: user.status
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' ou 'account'
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('planos')
          .select('*')
          .order('nome');

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        toast.error('Erro ao carregar planos');
      }
    };

    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Verifica se houve mudanças
    const hasChanges = Object.entries(editedUser).some(
      ([key, value]) => value !== user[key as keyof AdminUser]
    );

    if (!hasChanges) {
      toast.info('Nenhuma alteração foi feita');
      onClose();
      return;
    }

    try {
      await onUpdate(editedUser);
      toast.success('Alterações salvas com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (value: string) => {
    const selectedPlan = plans.find(plan => plan.id === value);
    if (selectedPlan) {
      setEditedUser(prev => ({ ...prev, plano: value }));
      toast.info(`Plano selecionado: ${selectedPlan.nome} (${selectedPlan.validade} dias)`);
    }
  };

  const InputField = ({ 
    icon: Icon, 
    label, 
    type, 
    value, 
    onChange, 
    required = false,
    placeholder = ''
  }: {
    icon: any;
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
          required={required}
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  const SelectField = ({

    label,
    value,
    onChange,
    options
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; color?: string }[];
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="relative bg-violet-50 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Editar Usuário</h2>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'personal'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Informações Pessoais
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'account'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dados da Conta
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {activeTab === 'personal' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Plano"
                  value={editedUser.plano || ''}
                  onChange={handlePlanChange}
                  options={plans.map(plan => ({
                    value: plan.id,
                    label: `${plan.nome} (${plan.validade} dias)`
                  }))}
                />
                <SelectField
                  label="Status"
                  value={editedUser.status || ''}
                  onChange={(value) => setEditedUser(prev => ({ ...prev, status: value }))}
                  options={[
                    { value: 'active', label: 'Ativo' },
                    { value: 'inactive', label: 'Inativo' }
                  ]}
                />
                <div className="col-span-2">
                  <div className="flex items-start p-4 bg-violet-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-violet-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-violet-900">Informação Importante</h4>
                      <p className="mt-1 text-sm text-violet-700">
                        Alterações no plano ou status podem afetar imediatamente o acesso do usuário ao sistema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
