import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const ContactInfo = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-semibold mb-6 text-white">Informações de Contato</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <Phone className="w-6 h-6 text-secondary-light flex-shrink-0" />
            <div>
              <p className="font-medium text-white">Telefone</p>
              <p className="text-white/80">0800 328 7632</p>
              <p className="text-white/80">(11) 4089-9822</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <Mail className="w-6 h-6 text-secondary-light flex-shrink-0" />
            <div>
              <p className="font-medium text-white">E-mail</p>
              <p className="text-white/80">contato@inovavoiptelecom.com.br</p>
              <p className="text-white/80">suporte@inovavoiptelecom.com.br</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <MapPin className="w-6 h-6 text-secondary-light flex-shrink-0" />
            <div>
              <p className="font-medium text-white">Endereço</p>
              <p className="text-white/80">
                Av. Exemplo, 1000 - Sala 123
                <br />
                São Paulo - SP
                <br />
                CEP: 06652-415
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <Clock className="w-6 h-6 text-secondary-light flex-shrink-0" />
            <div>
              <p className="font-medium text-white">Horário de Atendimento</p>
              <p className="text-white/80">
                Segunda a Sexta: 09h às 18h
                <br />
                Sábado: 09h às 13h
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-semibold mb-6 text-white">Atendimento 24/7</h2>
        <p className="text-white/80">
          Nossa equipe de suporte está disponível 24 horas por dia, 7 dias por semana para auxiliar nossos clientes com suporte técnico e emergências.
        </p>
      </div>
    </div>
  );
};

export default ContactInfo;