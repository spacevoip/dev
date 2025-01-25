import React from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept, onReject }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Termos de Uso - Inova Voip Telecom</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh] prose prose-slate">
            <p className="text-sm text-gray-600 mb-4">CNPJ: 56.427.957/0001-73</p>

            <p className="mb-6">
              A Inova Voip Telecom, identificada pelo CNPJ 56.427.957/0001-73, estabelece os presentes Termos de Uso para regulamentar a utilização de seus serviços. Ao contratar ou utilizar qualquer serviço da Inova Voip Telecom, o cliente concorda integralmente com as condições abaixo:
            </p>

            <h3 className="text-lg font-semibold mb-3">1. Condições Gerais de Uso</h3>
            <ol className="list-decimal pl-5 mb-6 space-y-2">
              <li>O cliente se compromete a utilizar os serviços da Inova Voip Telecom exclusivamente para fins lícitos, respeitando a legislação vigente e os presentes Termos de Uso.</li>
              <li>É expressamente proibido o uso de robôs de atendimento ou qualquer automação para interagir com o sistema de forma não autorizada.</li>
              <li>Não aceitamos o uso de nossos serviços para práticas fraudulentas, sob qualquer circunstância.</li>
              <li>A Inova Voip Telecom não fornece, incentiva ou apoia serviços destinados à prática de fraudes.</li>
            </ol>

            <h3 className="text-lg font-semibold mb-3">2. Penalidades e Bloqueio</h3>
            <ol className="list-decimal pl-5 mb-6 space-y-2">
              <li>Qualquer tentativa de fraude ou uso indevido dos serviços da Inova Voip Telecom poderá resultar no bloqueio imediato do serviço, sem aviso prévio.</li>
              <li>Toda e qualquer prática fraudulenta identificada será encaminhada ao órgão responsável, acompanhada de todas as informações coletadas sobre o fraudador.</li>
              <li>A Inova Voip Telecom reserva-se o direito de rescindir o contrato unilateralmente em caso de violação dos Termos de Uso.</li>
            </ol>

            <h3 className="text-lg font-semibold mb-3">3. Planos e Períodos de Contratação</h3>
            <ol className="list-decimal pl-5 mb-6 space-y-2">
              <li>Os serviços contratados seguem os períodos definidos nos planos adquiridos.</li>
              <li>O período do plano é contado em dias completos, incluindo finais de semana e feriados, não sendo considerado apenas dias úteis.</li>
              <li>Ao término do período contratado, o cliente deverá renovar o plano para manter o acesso ao serviço.</li>
            </ol>

            <h3 className="text-lg font-semibold mb-3">4. Responsabilidade do Cliente</h3>
            <ol className="list-decimal pl-5 mb-6 space-y-2">
              <li>O cliente é responsável por todas as ações realizadas com o uso de seu acesso aos serviços da Inova Voip Telecom.</li>
              <li>É responsabilidade do cliente garantir que as informações fornecidas à Inova Voip Telecom sejam verdadeiras e atualizadas.</li>
            </ol>

            <h3 className="text-lg font-semibold mb-3">5. Confidencialidade e Segurança</h3>
            <ol className="list-decimal pl-5 mb-6 space-y-2">
              <li>A Inova Voip Telecom se compromete a proteger os dados e informações fornecidas pelos clientes, respeitando as disposições da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</li>
              <li>No entanto, em casos de fraude, os dados do fraudador poderão ser compartilhados com autoridades competentes para a devida responsabilização.</li>
            </ol>

            <h3 className="text-lg font-semibold mb-3">6. Disposições Finais</h3>
            <ol className="list-decimal pl-5 mb-6 space-y-2">
              <li>Ao utilizar os serviços da Inova Voip Telecom, o cliente declara estar ciente e de acordo com todos os termos e condições descritos neste documento.</li>
              <li>Estes Termos de Uso podem ser alterados a qualquer momento, mediante aviso prévio no site oficial da Inova Voip Telecom ou por meio de outros canais de comunicação.</li>
              <li>Este documento é regido pelas leis brasileiras, e qualquer controvérsia será resolvida no foro da comarca onde está situada a sede da Inova Voip Telecom.</li>
            </ol>

            <p className="text-sm text-gray-500 mt-8">
              Data da última atualização: 25/01/2025
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onReject}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
            >
              Não Aceito
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
            >
              Aceito os Termos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
