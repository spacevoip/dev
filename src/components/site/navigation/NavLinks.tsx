import React from 'react';
import { Link } from 'react-router-dom';

const NavLinks = () => {
  return (
    <div className="hidden md:flex items-center space-x-8">
      <div className="flex space-x-6">
        <Link to="/" className="hover:text-secondary transition-colors">Início</Link>
        <Link to="/pricing" className="hover:text-secondary transition-colors">Assinaturas & Planos</Link>
        <Link to="/contact" className="hover:text-secondary transition-colors">Contato</Link>
      </div>
      
      <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors border border-white/20">
        Login / Cadastro
      </button>
    </div>
  );
};

export default NavLinks;