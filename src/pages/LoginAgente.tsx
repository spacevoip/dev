import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { loginAgent } from '../lib/agentAuth';
import { toast } from 'sonner';

export const LoginAgente = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    numero: '',
    senha: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { agent, error } = await loginAgent(credentials);

      if (error) {
        setError(error);
        toast.error(error, {
          duration: 4000,
        });
        setLoading(false);
        return;
      }

      if (agent) {
        // Armazenar dados do agente
        localStorage.setItem('agent', JSON.stringify(agent));
        
        toast.success('Login realizado com sucesso!', {
          duration: 2000,
        });
        
        // Redirecionar diretamente para o dashboard do agente
        navigate('/dash-agente', { replace: true });
      }
    } catch (err) {
      setError('Erro inesperado ao fazer login. Por favor, tente novamente.');
      toast.error('Erro inesperado ao fazer login. Por favor, tente novamente.', {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <img 
              src="/logoinovavoip.png" 
              alt="InovaVoip Logo" 
              className="h-32 w-auto mx-auto"
            />
            <h2 className="text-3xl font-bold text-white tracking-tight">Área do Agente</h2>
            <p className="text-gray-300">Acesse sua conta para gerenciar chamadas</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-12 space-y-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Ramal
                </label>
                <input
                  type="text"
                  value={credentials.numero}
                  onChange={(e) => {
                    setCredentials(prev => ({ ...prev, numero: e.target.value.trim() }));
                    setError('');
                  }}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors"
                  placeholder="Digite seu ramal"
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
                  value={credentials.senha}
                  onChange={(e) => {
                    setCredentials(prev => ({ ...prev, senha: e.target.value }));
                    setError('');
                  }}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors"
                  placeholder="Digite sua senha"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !credentials.numero || !credentials.senha}
              className={`w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                ${(!credentials.numero || !credentials.senha) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>

      {/* Lado Direito - Imagem */}
      <div className="hidden md:block md:w-1/2 bg-cover bg-center" style={{ backgroundImage: 'url(/agent-login-bg.jpg)' }}>
        <div className="h-full w-full bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Central de Atendimento</h3>
            <p className="text-gray-200">
              Gerencie suas chamadas, acompanhe estatísticas e mantenha-se conectado com sua equipe através do nosso painel intuitivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
