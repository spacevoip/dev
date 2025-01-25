import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { sendOTP, verifyOTP } from '../../services/otpService';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  phoneNumber: string;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  phoneNumber
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout>();
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      handleSendCode();
    }
    
    // Limpa o contador ao fechar o modal
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [isOpen]);

  const startCountdown = () => {
    setCountdown(10);
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    try {
      setSending(true);
      const result = await sendOTP(phoneNumber);
      
      if (result.success) {
        toast.success('SMS enviado com sucesso! Aguarde até 5 segundos para receber o código.', {
          duration: 5000 // Mostra por 5 segundos
        });
        // Inicia o contador de 10 segundos
        startCountdown();
        // Foca no primeiro input
        refs[0].current?.focus();
      } else {
        toast.error(result.message);
        onClose();
      }
    } catch (error) {
      toast.error('Erro ao enviar código de verificação');
      onClose();
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return; // Aceita apenas números

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move para o próximo input se houver um valor
    if (value && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move para o input anterior ao pressionar backspace em um input vazio
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Por favor, insira o código completo');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyOTP(phoneNumber, code);
      
      if (isValid) {
        toast.success('Telefone verificado com sucesso!');
        onVerified();
        onClose();
      } else {
        toast.error('Código inválido');
        // Limpa os campos
        setOtp(['', '', '', '', '', '']);
        refs[0].current?.focus();
      }
    } catch (error) {
      toast.error('Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Verificar Telefone</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Enviamos um código de verificação para seu telefone{' '}
              <span className="font-medium">{phoneNumber}</span>
            </p>
            <p className="text-sm text-gray-500">
              O código será enviado por SMS e pode levar até 5 segundos para chegar.
            </p>

            {/* OTP Input */}
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={refs[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                  disabled={loading || sending}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleVerifyCode}
                disabled={loading || sending || otp.join('').length !== 6}
                className="w-full py-2.5 px-4 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>

              <button
                onClick={handleSendCode}
                disabled={loading || sending || countdown > 0}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Enviando...' : countdown > 0 ? `Aguarde ${countdown}s para reenviar` : 'Reenviar código'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
