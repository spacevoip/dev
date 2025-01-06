import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Lock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { register } from '../lib/auth';
import { toast } from 'react-hot-toast';

export const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!formData.name.trim()) {
      toast.error('O nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('O email é obrigatório');
      return;
    }

    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 11) {
      toast.error('Digite um número de telefone válido');
      return;
    }

    if (!formData.document.trim()) {
      toast.error('O CPF/CNPJ é obrigatório');
      return;
    }

    // Validação específica para CPF/CNPJ
    const documentNumbers = formData.document.replace(/\D/g, '');
    if (documentNumbers.length !== 11 && documentNumbers.length !== 14) {
      toast.error('Digite um CPF ou CNPJ válido');
      return;
    }

    if (!formData.password) {
      toast.error('A senha é obrigatória');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        contato: formData.phone.trim(),
        documento: formData.document.trim(),
        password: formData.password
      });

      if (error) {
        toast.error(error);
        return;
      }

      if (user) {
        toast.success('Conta criada com sucesso!');
        navigate('/login');
      }
    } catch (err) {
      toast.error('Erro ao criar conta');
      console.error('Erro no registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <img 
              src="/logoinovavoip.png" 
              alt="InovaVoip Logo" 
              className="h-32 w-auto mx-auto"
            />
            <h2 className="text-3xl font-bold text-white tracking-tight">Criar Conta</h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-12 space-y-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-colors"
                  placeholder="Digite seu nome"
                  required
                  disabled={loading}
                  minLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value.trim() }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-colors"
                  placeholder="Digite seu email"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    // Remove tudo que não for número
                    const value = e.target.value.replace(/\D/g, '');
                    // Formata o telefone: (99) 99999-9999
                    const formatted = value
                      .replace(/^(\d{2})/, '($1) ')
                      .replace(/(\d{5})(\d)/, '$1-$2')
                      .substr(0, 15);
                    setFormData(prev => ({ ...prev, phone: formatted }));
                  }}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-colors"
                  placeholder="(00) 00000-0000"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => {
                    // Remove tudo que não for número
                    const value = e.target.value.replace(/\D/g, '');
                    // Formata CPF (xxx.xxx.xxx-xx) ou CNPJ (xx.xxx.xxx/xxxx-xx)
                    let formatted = value;
                    if (value.length <= 11) { // CPF
                      formatted = value
                        .replace(/(\d{3})(\d)/, '$1.$2')
                        .replace(/(\d{3})(\d)/, '$1.$2')
                        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    } else { // CNPJ
                      formatted = value
                        .replace(/^(\d{2})(\d)/, '$1.$2')
                        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                        .replace(/\.(\d{3})(\d)/, '.$1/$2')
                        .replace(/(\d{4})(\d)/, '$1-$2')
                        .substr(0, 18);
                    }
                    setFormData(prev => ({ ...prev, document: formatted }));
                  }}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-colors"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-colors"
                  placeholder="Crie uma senha"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-colors"
                  placeholder="Confirme sua senha"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                'Criar Conta'
              )}
            </button>

            <p className="text-center text-base text-gray-300">
              Já tem uma conta?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="font-medium text-lg text-violet-400 hover:text-violet-300 transition-colors"
                disabled={loading}
              >
                Fazer Login
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Lado Direito - Imagem */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-[3000ms]" 
          style={{ 
            backgroundImage: 'url(https://avoip.com.br/wp-content/uploads/2024/02/58b9bc5b-a764-48b8-8969-621a3464f2b2.jpeg)'
          }}
        />
        {/* Gradiente superior */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-transparent to-transparent" />
        {/* Gradiente lateral */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-indigo-950/30 to-transparent" />
        {/* Efeito de brilho */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-gradient-to-br from-violet-500/20 via-transparent to-indigo-500/20" />
        {/* Efeito de partículas */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px] opacity-[0.03]" />
      </div>
    </div>
  );
};