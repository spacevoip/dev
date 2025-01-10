import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

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

  // Função para verificar o status do usuário
  const checkUserStatus = async () => {
    try {
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('status')
        .eq('id', user.id)
        .single();

      if (!userData || (userData.status !== 'ativo' && userData.status !== 'active')) {
        toast.error('Sua conta foi desativada. Entre em contato com o Suporte Via Chat.', {
          duration: 5000,
        });
        await signOut();
      }
    } catch (error) {
      console.error('Erro ao verificar status do usuário:', error);
    }
  };

  useEffect(() => {
    // Carrega o usuário do localStorage e verifica a validade da sessão
    const loadUser = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          
          // Verifica se o usuário está ativo e atualiza seus dados
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', parsedUser.id)
            .single();

          if (!userData || (userData.status !== 'ativo' && userData.status !== 'active')) {
            // Se o usuário não estiver ativo, faz logout
            toast.error('Sua conta foi desativada. Entre em contato com o Suporte Via Chat.', {
              duration: 5000,
            });
            await signOut();
          } else {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Efeito para verificar o status do usuário periodicamente
  useEffect(() => {
    if (!user) return;

    // Verifica o status a cada 30 segundos
    const interval = setInterval(checkUserStatus, 30000);

    // Inscreve-se em mudanças na tabela de usuários
    const userStatusSubscription = supabase
      .channel('user-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          const newStatus = payload.new.status;
          if (newStatus !== 'ativo' && newStatus !== 'active') {
            toast.error('Sua conta foi desativada. Entre em contato com o Suporte Via Chat.', {
              duration: 5000,
            });
            await signOut();
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      userStatusSubscription.unsubscribe();
    };
  }, [user]);

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
