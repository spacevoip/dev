import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega o usuário do localStorage e verifica a validade da sessão
    const loadUser = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Verifica se o token ainda é válido
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
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
      }
      setLoading(false);
    };

    loadUser();

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

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
    loading
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
