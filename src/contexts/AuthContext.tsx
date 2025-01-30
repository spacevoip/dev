import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import bcrypt from 'bcryptjs';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  signOut: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  const checkUserStatus = async () => {
    try {
      if (!user) return;

      const { data: userData, error } = await supabase
        .from('users')
        .select('status')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!userData || (userData.status !== 'ativo' && userData.status !== 'active')) {
        toast.error('Sua conta foi desativada. Entre em contato com o Suporte Via Chat.', {
          duration: 5000,
        });
        await signOut();
      }
    } catch (error) {
      console.error('Erro ao verificar status do usuário:', error);
      await signOut();
    }
  };

  const checkAndRefreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session?.user?.email) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (userError) throw userError;

        if (userData && (userData.status === 'ativo' || userData.status === 'active')) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          await signOut();
        }
      } else if (user) {
        // Se não tem sessão mas tem user no state, verifica o status
        await checkUserStatus();
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      await signOut();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAndRefreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user');
      } else if (event === 'SIGNED_IN' && session?.user?.email) {
        checkAndRefreshSession();
      }
    });

    // Verifica o status do usuário periodicamente
    const statusInterval = setInterval(checkUserStatus, 60000); // A cada minuto

    return () => {
      subscription.unsubscribe();
      clearInterval(statusInterval);
    };
  }, []);

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Verifica a senha atual
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Senha atual incorreta');
      }

      // Gera o hash da nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Atualiza a senha no banco
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Senha atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar senha');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signOut, updatePassword }}>
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
