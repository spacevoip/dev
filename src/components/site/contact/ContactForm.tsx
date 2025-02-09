import React from 'react';
import { Send } from 'lucide-react';

const ContactForm = () => {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-semibold mb-6 text-white">Fale Conosco</h2>
      <form className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
              Nome
            </label>
            <input
              type="text"
              id="name"
              className="input-field"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-white/80 mb-2">
              Empresa
            </label>
            <input
              type="text"
              id="company"
              className="input-field"
              placeholder="Nome da empresa"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            className="input-field"
            placeholder="seu@email.com"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
            Telefone
          </label>
          <input
            type="tel"
            id="phone"
            className="input-field"
            placeholder="(00) 00000-0000"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
            Mensagem
          </label>
          <textarea
            id="message"
            rows={4}
            className="input-field resize-none"
            placeholder="Como podemos ajudar?"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary text-white py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <span>Enviar Mensagem</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ContactForm;