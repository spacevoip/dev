import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertCircle, Loader2, Check, Calendar, Users, Clock, ClipboardCopy, CheckCircle2 } from 'lucide-react';
import { Plan } from '../../types/Plan';
import { CurrentUser } from '../../hooks/useCurrentUser';
import { usePayments } from '../../hooks/usePayments';
import { toast } from 'sonner';

interface PurchasePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  currentUser: CurrentUser;
  planPrice: number;
  onPaymentSuccess?: () => void;
}

const PurchasePlanModal: React.FC<PurchasePlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  currentUser,
  planPrice,
  onPaymentSuccess,
}) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [qrCodeText, setQrCodeText] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { createPayment, checkPaymentStatus, loading } = usePayments();

  const handleClose = () => {
    if (paymentSuccess) {
      onPaymentSuccess?.();
    }
    onClose();
  };

  useEffect(() => {
    if (!showQRCode || !paymentId) return;

    const interval = setInterval(async () => {
      const payment = await checkPaymentStatus(paymentId);
      if (payment) {
        setPaymentSuccess(true);
        clearInterval(interval);
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId, showQRCode, onClose]);

  useEffect(() => {
    if (!showQRCode) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 0) {
          clearInterval(interval);
          onClose();
          toast.error('Tempo para pagamento expirado. Tente novamente.');
          return 0;
        }
        return prevTimeLeft - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showQRCode, onClose]);

  const handleContinue = async () => {
    if (!termsAccepted) {
      toast.error('Você precisa aceitar os termos de uso para continuar.');
      return;
    }

    try {
      const payment = await createPayment({
        plano: plan.name,
        accountid: currentUser.accountid,
        valor: planPrice
      });

      if (payment) {
        setPaymentId(payment.txid);
        setQrCodeImage(payment.QRCodeLink);
        setQrCodeText(payment.QRCodeText);
        setShowQRCode(true);
      }
    } catch (err) {
      console.error('Erro ao gerar pagamento:', err);
      toast.error('Erro ao gerar pagamento. Tente novamente.');
    }
  };

  const handleCopyPix = () => {
    if (qrCodeText) {
      navigator.clipboard.writeText(qrCodeText).then(() => {
        toast.success('Código PIX copiado!');
      });
    }
  };

  const TermsContent = () => (
    <div className="space-y-6 text-sm text-gray-700">
      <h2 className="text-lg font-semibold text-gray-900">Termos de Uso - Serviço de Telefonia VoIP</h2>
      
      <section>
        <h3 className="font-medium text-gray-900 mb-2">1. Planos e Condições Gerais</h3>
        <p>1.1. Os planos de telefonia VoIP oferecidos são ilimitados, permitindo o uso dentro das políticas e diretrizes deste termo.</p>
        <p>1.2. Cada ramal contratado permite apenas uma chamada simultânea por vez. A contratação de ramais adicionais pode ser feita conforme necessidade do cliente.</p>
        <p>1.3. O sistema é baseado em períodos previamente determinados e não segue a modalidade de cobrança mensal fixa. O cliente deve verificar e concordar com os períodos estabelecidos no momento da contratação.</p>
      </section>

      <section>
        <h3 className="font-medium text-gray-900 mb-2">2. Identificação de Chamadas (Caller ID)</h3>
        <p>2.1. Embora seja possível configurar um Caller ID personalizado, não garantimos que o número escolhido pelo cliente será exibido no display de todos os destinatários. Isso pode variar conforme as redes de operadoras envolvidas na chamada.</p>
      </section>

      <section>
        <h3 className="font-medium text-gray-900 mb-2">3. Uso Aceitável do Serviço</h3>
        <p>3.1. O uso do serviço deve ser feito de maneira legal e ética. É estritamente proibido:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Realizar chamadas automatizadas ou usar robôs de discagem automática;</li>
          <li>Praticar fraudes, falsificações de identidade ou atividades que violem leis aplicáveis;</li>
          <li>Utilizar o serviço para fins comerciais que não estejam expressamente autorizados.</li>
        </ul>
        <p>3.2. Caso sejam detectadas anomalias ou comportamentos atípicos no perfil de uso do cliente, o serviço poderá ser suspenso ou bloqueado de forma permanente, sem direito a reembolso dos valores pagos.</p>
      </section>

      <section>
        <h3 className="font-medium text-gray-900 mb-2">4. Responsabilidades do Cliente</h3>
        <p>4.1. O cliente é integralmente responsável pela segurança das informações de login e pela configuração adequada do sistema em seus dispositivos.</p>
        <p>4.2. É responsabilidade do cliente garantir que seu uso do serviço esteja de acordo com este termo e com as leis vigentes.</p>
      </section>

      <section>
        <h3 className="font-medium text-gray-900 mb-2">5. Limitação de Garantias e Responsabilidades</h3>
        <p>5.1. O serviço de telefonia VoIP é fornecido "como está", sem garantias adicionais de funcionamento ininterrupto ou livre de falhas. Eventuais indisponibilidades serão tratadas com prioridade, mas não geram direito a ressarcimento.</p>
        <p>5.2. A empresa não se responsabiliza por problemas causados por terceiros, como falhas em redes de operadoras ou problemas de infraestrutura local do cliente.</p>
      </section>

      <section>
        <h3 className="font-medium text-gray-900 mb-2">6. Vigência e Rescisão</h3>
        <p>6.1. Este termo é vigente a partir da contratação do serviço e pode ser alterado mediante aviso prévio.</p>
        <p>6.2. O descumprimento das condições aqui estabelecidas poderá resultar na rescisão imediata do serviço.</p>
      </section>

      <section>
        <h3 className="font-medium text-gray-900 mb-2">7. Disposições Finais</h3>
        <p>7.1. Ao contratar o serviço, o cliente declara que leu, compreendeu e concorda com todos os termos aqui estabelecidos.</p>
        <p>7.2. Qualquer dúvida ou situação não prevista neste termo deverá ser tratada diretamente com o suporte da empresa.</p>
      </section>
    </div>
  );

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      {showQRCode ? 'Pagamento PIX' : 'Confirmar Upgrade de Plano'}
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {!showQRCode ? (
                    <>
                      <div className="space-y-6">
                        {/* Card do Plano */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-2xl font-bold">{plan.name}</h3>
                              <p className="text-blue-100 mt-1">Plano Selecionado</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  {formatCurrency(planPrice)}
                                </span>
                                <span className="text-gray-500 text-sm">/Periodo</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <Users className="h-6 w-6 mx-auto text-blue-100" />
                              <p className="mt-1 text-sm text-blue-100">Até</p>
                              <p className="font-semibold">{plan.extensionsLimit} Ramais</p>
                            </div>
                            <div className="text-center">
                              <Calendar className="h-6 w-6 mx-auto text-blue-100" />
                              <p className="mt-1 text-sm text-blue-100">Validade</p>
                              <p className="font-semibold">{plan.validity} Dias</p>
                            </div>
                            <div className="text-center">
                              <Clock className="h-6 w-6 mx-auto text-blue-100" />
                              <p className="mt-1 text-sm text-blue-100">Ativação</p>
                              <p className="font-semibold">Imediata</p>
                            </div>
                          </div>
                        </div>

                        {/* Recursos do Plano */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="text-sm font-medium text-gray-500 mb-4">Recursos Inclusos</h4>
                          <ul className="space-y-3">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center text-gray-700">
                                <Check className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Dados do Cliente */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="text-sm font-medium text-gray-500 mb-4">Dados do Cliente</h4>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="text-gray-500">Nome:</span>{' '}
                              <span className="text-gray-900 font-medium">{currentUser.name}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">E-mail:</span>{' '}
                              <span className="text-gray-900">{currentUser.email}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">ID da Conta:</span>{' '}
                              <span className="text-gray-900 font-mono">{currentUser.accountid}</span>
                            </p>
                          </div>
                        </div>

                        {/* Regras Importantes */}
                        <div className="bg-red-50 rounded-xl p-6">
                          <h4 className="text-sm font-medium text-red-800 flex items-center mb-4">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Regras Importantes
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              </div>
                              <p className="ml-3 text-sm text-red-700">
                                É estritamente proibido o uso de robôs para realizar ligações automáticas.
                              </p>
                            </div>
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              </div>
                              <p className="ml-3 text-sm text-red-700">
                                Caso seja detectada alguma anomalia no perfil de discagem do usuário, o acesso à conta será bloqueado, sem possibilidade de reembolso de valores pagos!
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Aviso */}
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <AlertCircle className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">
                                Ao prosseguir, será gerado um QR Code PIX para pagamento. 
                                Após a confirmação, seu plano será atualizado automaticamente.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Checkbox de Termos */}
                      <div className="mt-6 flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                          Eu li e aceito os{' '}
                          <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            termos de uso
                          </button>
                        </label>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={handleContinue}
                          disabled={loading || !termsAccepted}
                          className={`w-full px-6 py-3 rounded-xl font-medium text-white transition-all transform ${
                            !termsAccepted 
                              ? 'bg-gray-400 cursor-not-allowed opacity-50'
                              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:scale-[1.02]'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {loading ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Gerando Pagamento...
                            </span>
                          ) : (
                            'Continuar com o Pagamento'
                          )}
                        </button>
                        {!termsAccepted && (
                          <p className="text-sm text-red-500 mt-2 text-center">
                            Aceite os termos de uso para continuar
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center">
                        {paymentSuccess ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                              <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Pagamento Confirmado!
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Seu plano foi atualizado com sucesso
                            </p>
                            <div className="animate-pulse text-sm text-gray-500">
                              Redirecionando...
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Informações do Plano */}
                            <div className="bg-blue-50 rounded-xl p-4 mb-6">
                              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                              <p className="text-blue-600 font-medium">{formatCurrency(planPrice)}</p>
                            </div>

                            {/* QR Code */}
                            <div className="bg-white rounded-xl p-8 mb-6 shadow-sm border">
                              <img 
                                src={qrCodeImage} 
                                alt="QR Code PIX" 
                                className="mx-auto w-48 h-48 mb-4"
                              />
                              <div className="space-y-4">
                                {/* TxId */}
                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <span className="text-sm text-gray-600">TxId:</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-mono">{paymentId}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(paymentId || '');
                                        toast.success('TxId copiado!');
                                      }}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <ClipboardCopy className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Botão Copiar PIX */}
                                <button
                                  onClick={handleCopyPix}
                                  className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                  <ClipboardCopy className="h-4 w-4" />
                                  <span>Copiar código PIX</span>
                                </button>
                              </div>
                            </div>

                            {/* Timer */}
                            <div className="text-center mb-6">
                              <p className="text-sm text-gray-600">
                                Tempo restante para pagamento:
                              </p>
                              <span className="text-2xl font-semibold text-gray-900">
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                              Escaneie o QR Code acima com seu aplicativo de pagamento
                            </p>

                            {/* Status */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-center justify-center text-sm text-blue-700">
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Aguardando confirmação do pagamento...
                            </div>

                            {/* Botão Cancelar */}
                            <button
                              onClick={onClose}
                              className="mt-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              Cancelar Pagamento
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal dos Termos de Uso */}
      <Transition appear show={showTerms} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowTerms(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      Termos de Uso
                    </Dialog.Title>
                    <button
                      onClick={() => setShowTerms(false)}
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto pr-6 -mr-6">
                    <TermsContent />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowTerms(false)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Fechar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default PurchasePlanModal;
