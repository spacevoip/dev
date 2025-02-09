import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 p-3 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
    >
      <LogOut className="h-5 w-5" />
      <span>Sair</span>
    </button>
  );
};