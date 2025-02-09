import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { loginAgent } from '../lib/agentAuth';
import { toast } from 'sonner';
import { useAgent } from '../contexts/AgentContext';

export const LoginAgente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAgent } = useAgent();
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
        // Atualizar o contexto
        setAgent(agent);
        
        toast.success('Login realizado com sucesso!', {
          duration: 2000,
        });
        
        // Redirecionar para o dashboard do agente usando navigate
        const from = location.state?.from || '/dash-agente';
        navigate(from, { replace: true });
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
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-4 py-3.5 font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                loading ? 'animate-pulse' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Área do Cliente →
            </Link>
          </div>
        </div>
      </div>

      {/* Lado Direito - Imagem */}
      <div className="hidden md:block md:w-1/2 bg-[url('/agent-bg.jpg')] bg-cover bg-center">
        <div className="h-full w-full backdrop-blur-sm bg-black/30 p-8">
          <div className="h-full flex flex-col justify-center max-w-lg mx-auto space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Gerencie suas chamadas com facilidade
            </h2>
            <p className="text-xl text-gray-200">
              Acesse o painel do agente para visualizar chamadas ativas, histórico e muito mais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
