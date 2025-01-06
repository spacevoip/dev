import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { login } from '../lib/auth';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, error } = await login(credentials);

      if (error) {
        toast.error(error, {
          duration: 4000,
          position: 'top-center',
        });
        setLoading(false);
        return;
      }

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        toast.success('Login realizado com sucesso!', {
          duration: 2000,
          position: 'top-center',
        });
        
        navigate('/', { replace: true });
      }
    } catch (err) {
      toast.error('Erro inesperado ao fazer login. Por favor, tente novamente.', {
        duration: 4000,
        position: 'top-center',
      });
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
            <h2 className="text-3xl font-bold text-white tracking-tight">Faça seu Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-12 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value.trim() }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-colors"
                  placeholder="Digite seu email"
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
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-colors"
                  placeholder="Digite sua senha"
                  required
                  disabled={loading}
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
                'Entrar'
              )}
            </button>

            <p className="text-center text-base text-gray-300">
              Ainda não tem uma conta?{' '}
              <a href="/register" className="font-medium text-lg text-violet-400 hover:text-violet-300 transition-colors">
                Criar conta
              </a>
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
        {/* Efeito de partículas (opcional) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px] opacity-[0.03]" />
      </div>
    </div>
  );
};