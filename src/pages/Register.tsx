import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { register } from '../lib/auth';
import { TermsModal } from '../components/Terms/TermsModal';
import { OTPVerificationModal } from '../components/OTP/OTPVerificationModal';
import { checkPhoneExists } from '../services/userService';
import { AlertCircle } from 'lucide-react';
import { validateAndFormatDocument } from '../utils/documentValidation';

export const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneInUse, setPhoneInUse] = useState(false);
  const [documentInvalid, setDocumentInvalid] = useState(false);
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ' | null>(null);
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
    setErrorMessage(null);
    
    // Validações dos campos obrigatórios
    if (!formData.name.trim()) {
      toast.error('O nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('O e-mail é obrigatório');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('O telefone é obrigatório');
      return;
    }

    if (!phoneVerified) {
      toast.error('É obrigatório verificar o número de telefone');
      return;
    }

    if (!formData.document.trim()) {
      toast.error('O CPF/CNPJ é obrigatório');
      return;
    }

    if (documentInvalid) {
      toast.error('O CPF/CNPJ é inválido');
      return;
    }

    if (!formData.password) {
      toast.error('A senha é obrigatória');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (!acceptedTerms) {
      toast.error('Você precisa aceitar os termos de uso para continuar');
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        contato: formData.phone.replace(/\D/g, ''),
        documento: formData.document.replace(/\D/g, ''),
        password: formData.password
      });

      if (error) {
        // Se for erro de IP, mostra na interface
        if (error.startsWith('IP_ERROR:')) {
          const clientIP = error.split(':')[1];
          setErrorMessage(clientIP);
          setLoading(false);
          return;
        } else {
          toast.error(error);
        }
        return;
      }

      if (user) {
        // Salva o usuário no localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Conta criada com sucesso! Redirecionando para o login...');
        
        // Pequeno delay para mostrar a mensagem antes do redirecionamento
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      console.error('Erro no registro:', err);
      toast.error('Erro ao criar conta');
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
            
            {/* Mensagem de Erro de IP */}
            {errorMessage && (
              <div className="mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-xl shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold">Aviso de Segurança</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Seu IP:</span>{' '}
                      <span className="font-mono bg-red-100 px-2 py-0.5 rounded">
                        {errorMessage}
                      </span>
                    </p>
                    
                    <p className="font-medium">
                      Este endereço IP já possui uma conta registrada em nosso sistema.
                    </p>
                    
                    <p>
                      Por motivos de segurança, permitimos apenas uma conta por endereço IP.
                    </p>
                    
                    <div className="pt-2">
                      <p className="font-medium">Para resolver esta situação, você pode:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Entrar em contato via chat para suporte</li>
                        <li>
                          Enviar mensagem pelo WhatsApp:{' '}
                          <a 
                            href="https://wa.link/1457q5" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            Clique aqui para abrir o WhatsApp
                            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="mt-8 space-y-6"
            autoComplete="off"
          >
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
                  placeholder="Digite seu nome completo"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-colors"
                  placeholder="Digite seu e-mail"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Telefone
                </label>
                <div className="relative">
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
                      // Reset verificação e status se o número mudar
                      if (phoneVerified) setPhoneVerified(false);
                      if (phoneInUse) setPhoneInUse(false);
                    }}
                    className={`w-full bg-white/10 backdrop-blur-sm border rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all ${
                      phoneInUse 
                        ? 'border-red-500 animate-shake' 
                        : phoneVerified
                          ? 'border-green-500 pr-24'
                          : 'border-white/10 pr-32'
                    }`}
                    placeholder="(00) 00000-0000"
                    required
                    disabled={loading}
                    autoComplete="off"
                  />
                  {phoneInUse && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-xs font-medium">Em uso</span>
                    </div>
                  )}
                  {!phoneInUse && (
                    <button
                      type="button"
                      onClick={async () => {
                        const phone = formData.phone;
                        if (phone.replace(/\D/g, '').length < 11) {
                          toast.error('Digite um número de telefone válido');
                          return;
                        }

                        try {
                          const exists = await checkPhoneExists(phone);
                          if (exists) {
                            setPhoneInUse(true);
                            toast.error(
                              'Este número de telefone já está cadastrado. Para mais informações, entre em contato conosco pelo chat.',
                              { duration: 6000 }
                            );
                            return;
                          }
                          setShowOTPModal(true);
                        } catch (error) {
                          console.error('Erro ao verificar telefone:', error);
                          toast.error('Erro ao verificar disponibilidade do telefone');
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-500/20 text-violet-200 hover:bg-violet-500/30 transition-colors disabled:opacity-50"
                      disabled={loading || phoneVerified}
                    >
                      {phoneVerified ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verificado
                        </span>
                      ) : (
                        'Verificar Telefone'
                      )}
                    </button>
                  )}
                </div>
                {phoneInUse && (
                  <p className="mt-2 text-sm text-red-400">
                    Este número já está em uso. Entre em contato via chat para mais informações.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  CPF/CNPJ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => {
                      const result = validateAndFormatDocument(e.target.value);
                      setFormData(prev => ({ ...prev, document: result.formatted }));
                      setDocumentInvalid(!result.isValid && e.target.value.length > 0);
                      setDocumentType(result.type);
                    }}
                    className={`w-full bg-white/10 backdrop-blur-sm border rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all ${
                      documentInvalid 
                        ? 'border-red-500 animate-shake' 
                        : documentType && !documentInvalid
                          ? 'border-green-500'
                          : 'border-white/10'
                    }`}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    required
                    disabled={loading}
                    autoComplete="off"
                    maxLength={18}
                  />
                  {documentType && !documentInvalid && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-medium">{documentType}</span>
                    </div>
                  )}
                  {documentInvalid && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-xs font-medium">Inválido</span>
                    </div>
                  )}
                </div>
                {documentInvalid && (
                  <p className="mt-2 text-sm text-red-400">
                    {documentType === 'CPF' 
                      ? 'CPF inválido. Verifique os números digitados.' 
                      : documentType === 'CNPJ'
                        ? 'CNPJ inválido. Verifique os números digitados.'
                        : 'Digite um CPF ou CNPJ válido.'}
                  </p>
                )}
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
                  placeholder="Digite sua senha"
                  required
                  disabled={loading}
                  minLength={6}
                  autoComplete="new-password"
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
                  autoComplete="new-password"
                />
              </div>

              {/* Termos de Uso */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={() => setShowTerms(true)}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-600"
                    required
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="terms" className="text-sm text-gray-200">
                    Li e aceito os{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-violet-400 hover:text-violet-300 underline focus:outline-none"
                    >
                      termos de uso
                    </button>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !acceptedTerms || !phoneVerified || documentInvalid}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Já tem uma conta? Entre aqui
                </button>
              </div>
            </div>
          </form>

          {/* Modal de Termos */}
          <TermsModal
            isOpen={showTerms}
            onClose={() => {
              setShowTerms(false);
              setAcceptedTerms(false); // Desmarca o checkbox se fechar sem aceitar
            }}
            onAccept={() => {
              setAcceptedTerms(true);
              setShowTerms(false);
              toast.success('Termos de uso aceitos');
            }}
            onReject={() => {
              setAcceptedTerms(false);
              setShowTerms(false);
              toast.error('Você precisa aceitar os termos de uso para continuar');
            }}
          />

          {/* Modal de OTP */}
          <OTPVerificationModal
            isOpen={showOTPModal}
            onClose={() => setShowOTPModal(false)}
            onVerified={() => setPhoneVerified(true)}
            phoneNumber={formData.phone}
          />
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
        {/* Efeito de partículas (opcional) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px] opacity-[0.03]" />
      </div>
    </div>
  );
};