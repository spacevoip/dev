import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para fazer logout
  const signOut = async () => {
    try {
      // Desconecta o usuário
      await supabase.auth.signOut();
      
      // Remove dados do usuário
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');

      // Redireciona para login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  useEffect(() => {
    // Carrega o usuário do localStorage e verifica a validade da sessão
    const loadUser = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          
          // Verifica se o usuário está ativo
          const { data: userData } = await supabase
            .from('users')
            .select('status')
            .eq('id', parsedUser.id)
            .single();

          // Se o usuário estiver inativo, faz logout
          if (userData?.status === 'inativo') {
            toast.error('Sua conta está inativa. Entre em contato com o suporte.');
            signOut();
            return;
          }

          // Verifica a validade do token
          const tokenExpiry = localStorage.getItem('tokenExpiry');
          if (tokenExpiry && new Date(tokenExpiry) > new Date()) {
            setUser(parsedUser);
          } else {
            // Token expirado, limpa o storage
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
      } finally {
        setLoading(false);
      }
    };

    // Adiciona listener para sincronizar entre abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };

    loadUser();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    user,
    setUser: (newUser: User | null) => {
      setUser(newUser);
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
        // Define expiração do token para 24 horas
        const expiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiry', expiry.toISOString());
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
      }
    },
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
