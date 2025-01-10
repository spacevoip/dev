import React, { useEffect } from 'react';
import { X, Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: 'bg-white border-l-4 border-l-green-500',
    info: 'bg-white border-l-4 border-l-blue-500',
    warning: 'bg-white border-l-4 border-l-yellow-500',
    error: 'bg-white border-l-4 border-l-red-500',
  };

  const iconStyles = {
    success: 'text-green-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };

  const Icon = {
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div
        className={`${styles[type]} flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md`}
        role="alert"
      >
        <Icon className={`${iconStyles[type]} h-5 w-5 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Atualização de Plano</p>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
          <button
            className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
            onClick={() => {
              // Aqui você pode adicionar a lógica para redirecionar para a página de suporte
              onClose();
            }}
          >
            Falar com o Suporte →
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
