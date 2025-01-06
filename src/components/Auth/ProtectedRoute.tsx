import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Se estiver carregando, mostra um spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Se não estiver logado, salva a URL atual e redireciona para o login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Se requer admin e o usuário não é admin, redireciona para o dashboard
  if (requireAdmin && user.role !== 'admin') {
    toast.error('Acesso restrito a administradores');
    return <Navigate to="/dash" replace />;
  }

  // Se passou por todas as verificações, renderiza o conteúdo
  return <>{children}</>;
};
