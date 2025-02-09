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
        
        // Redirecionar para o dashboard do agente com refresh
        window.location.href = '/dash-agente';
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                'Entrar'
              )}
            </button>

            <p className="text-center text-base text-gray-300">
              Área exclusiva para agentes.{' '}
              <Link to="/login" className="font-medium text-lg text-blue-400 hover:text-blue-300 transition-colors">
                Voltar para login principal
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Lado Direito - Imagem */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-[3000ms]" 
          style={{ 
            backgroundImage: 'url(https://avoip.com.br/wp-content/uploads/2024/02/callcenter.jpg)'
          }}
        />
        {/* Gradiente superior */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/80 via-transparent to-transparent" />
        {/* Gradiente lateral */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-950/30 to-transparent" />
        {/* Efeito de brilho */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-500/20" />
        {/* Efeito de partículas */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px] opacity-[0.03]" />
      </div>
    </div>
  );
};
