import React, { useState } from 'react';
import { CreditCard, CheckCircle, Star, Sparkles } from 'lucide-react';
import { RechargeForm } from '../components/Recharge/RechargeForm';
import { PaymentQRCode } from '../components/Recharge/PaymentQRCode';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

export const Recharge = () => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const { user } = useAuth();

  const handleRecharge = (amount: number) => {
    setRechargeAmount(amount);
    setShowQRCode(true);
  };

  // Se o usuário tem um plano ativo, mostra a mensagem de parabéns
  if (user?.plano) {
    return (
      <div className="min-h-[80vh] p-6 flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Efeito de brilho no topo */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 animate-gradient" />
            
            {/* Conteúdo principal */}
            <div className="p-8 sm:p-12">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Ícone com animação de pulso */}
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25" />
                  <div className="relative p-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full">
                    <CheckCircle className="h-16 w-16 text-white" />
                  </div>
                </div>

                {/* Título com decoração */}
                <div className="relative">
                  <Sparkles className="absolute -left-8 -top-4 h-6 w-6 text-yellow-400 animate-bounce" />
                  <Star className="absolute -right-8 -top-4 h-6 w-6 text-yellow-400 animate-bounce delay-100" />
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Parabéns!
                  </h2>
                </div>

                {/* Mensagem principal com efeito de fade in */}
                <div className="space-y-6 animate-fadeIn">
                  <p className="text-2xl text-gray-800 font-medium">
                    Você já possui um Plano Ativo
                  </p>
                  <p className="text-xl text-indigo-600 font-medium">
                    Não se Preocupe com Créditos!
                  </p>
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600">
                    <span className="text-xl font-bold text-white">
                      VOCÊ É ILIMITADO
                    </span>
                  </div>

                  {/* Benefícios */}
                  <div className="pt-8 grid grid-cols-1 gap-4 text-left">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-violet-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">GRAVAÇÃO AVANÇADA</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-violet-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">SUPORTE 24/7</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-violet-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">RELATÓRIOS DETALHADOS</span>
                    </div>
                  </div>
                </div>

                {/* Decoração inferior */}
                <div className="pt-6 flex justify-center space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400"
                      style={{
                        animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recarga</h1>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Adicionar Créditos</h2>
            <p className="text-sm text-gray-600">Saldo Atual: {formatCurrency(1250)}</p>
          </div>
        </div>

        <RechargeForm onSubmit={handleRecharge} />
      </div>

      {showQRCode && (
        <PaymentQRCode
          amount={rechargeAmount}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  );
};