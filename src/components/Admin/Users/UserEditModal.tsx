import React, { useState, useEffect } from 'react';
import { 
  X, Save, User, Mail, Phone, FileText, CreditCard, AlertCircle, History,
  Calendar, Building, MapPin, Globe, Shield, Clock
} from 'lucide-react';
import { AdminUser } from '../../../pages/admin/Users';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Plan {
  id: string;
  nome: string;
  validade: number;
  features?: string[];
}

interface UserEditModalProps {
  user: AdminUser;
  onClose: () => void;
  onUpdate: (updatedUser: Partial<AdminUser>) => Promise<void>;
}

interface ChangeLogEntry {
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: Date;
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
    status: user.status,
    company: user.company || '',
    phone: user.phone || '',
    address: user.address || '',
    website: user.website || '',
    role: user.role || 'user'
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

  // Detectar mudanças não salvas
  useEffect(() => {
    const hasChanges = Object.entries(editedUser).some(
      ([key, value]) => value !== user[key as keyof AdminUser]
    );
    setHasUnsavedChanges(hasChanges);
  }, [editedUser, user]);

  // Confirmação antes de fechar se houver mudanças
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Existem alterações não salvas. Deseja realmente sair?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!editedUser.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!editedUser.email?.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email)) {
      errors.email = 'Email inválido';
    }

    if (editedUser.phone && !/^\+?[\d\s-()]+$/.test(editedUser.phone)) {
      errors.phone = 'Telefone inválido';
    }

    if (editedUser.website && !/^https?:\/\/.*/.test(editedUser.website)) {
      errors.website = 'Website deve começar com http:// ou https://';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros antes de salvar');
      return;
    }

    setLoading(true);

    try {
      // Registrar mudanças no changelog
      const changes = Object.entries(editedUser).filter(
        ([key, value]) => value !== user[key as keyof AdminUser]
      ).map(([field, newValue]) => ({
        field,
        oldValue: String(user[field as keyof AdminUser] || ''),
        newValue: String(newValue || ''),
        timestamp: new Date()
      }));

      await onUpdate(editedUser);
      setChangeLog(prev => [...changes, ...prev]);
      toast.success('Alterações salvas com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando ele for editado
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const InputField = ({ 
    icon: Icon, 
    label, 
    field,
    type = 'text',
    required = false,
    placeholder = '',
    pattern = ''
  }: {
    icon: any;
    label: string;
    field: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    pattern?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          value={editedUser[field as keyof typeof editedUser] || ''}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 ${
            validationErrors[field] 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-200'
          }`}
          required={required}
          placeholder={placeholder}
          pattern={pattern}
        />
        {validationErrors[field] && (
          <p className="mt-1 text-sm text-red-500">{validationErrors[field]}</p>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden animate-scale-up">
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
            onClick={handleClose}
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
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Histórico
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  icon={User}
                  label="Nome"
                  field="name"
                  required
                  placeholder="Nome completo"
                />
                <InputField
                  icon={Mail}
                  label="Email"
                  field="email"
                  type="email"
                  required
                  placeholder="email@exemplo.com"
                />
                <InputField
                  icon={Phone}
                  label="Telefone"
                  field="phone"
                  placeholder="+55 (11) 99999-9999"
                />
                <InputField
                  icon={Building}
                  label="Empresa"
                  field="company"
                  placeholder="Nome da empresa"
                />
                <InputField
                  icon={MapPin}
                  label="Endereço"
                  field="address"
                  placeholder="Endereço completo"
                />
                <InputField
                  icon={Globe}
                  label="Website"
                  field="website"
                  placeholder="https://exemplo.com"
                />
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Plano
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={editedUser.plano || ''}
                        onChange={(e) => handleFieldChange('plano', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Selecione um plano</option>
                        {plans.map(plan => (
                          <option key={plan.id} value={plan.id}>
                            {plan.nome} ({plan.validade} dias)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={editedUser.status || ''}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                        <option value="suspended">Suspenso</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-violet-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-violet-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-violet-900">Informação Importante</h4>
                    <p className="mt-1 text-sm text-violet-700">
                      Alterações no plano ou status podem afetar imediatamente o acesso do usuário ao sistema.
                      Certifique-se de notificar o usuário sobre qualquer mudança.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Histórico de Alterações</h3>
                  <span className="text-sm text-gray-500">
                    {changeLog.length} alterações registradas
                  </span>
                </div>
                
                <div className="space-y-4">
                  {changeLog.length > 0 ? (
                    changeLog.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <History className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Campo <span className="font-medium">{entry.field}</span> alterado de{' '}
                            <span className="font-medium">{entry.oldValue || '(vazio)'}</span> para{' '}
                            <span className="font-medium">{entry.newValue || '(vazio)'}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(entry.timestamp, "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Nenhuma alteração registrada</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center text-sm text-gray-500">
              {hasUnsavedChanges && (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  Alterações não salvas
                </>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !hasUnsavedChanges}
                className="flex items-center px-6 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </form>
      </div>
    </div>
  );
};
