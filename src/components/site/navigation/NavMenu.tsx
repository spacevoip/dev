import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import NavDropdown from './NavDropdown';
import { solutions } from './menuItems';

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop & Mobile menu */}
      <nav className={`
        absolute md:relative top-full left-0 w-full md:w-auto
        md:flex items-center
        ${isOpen ? 'block' : 'hidden md:block'}
        bg-primary/95 md:bg-transparent backdrop-blur-lg md:backdrop-blur-none
        border-b border-white/10 md:border-none
        transition-all duration-300 ease-in-out
      `}>
        <div className="container mx-auto px-4 md:p-0">
          <div className="py-4 md:py-0 flex flex-col md:flex-row md:items-center md:space-x-6">
            <Link 
              to="/" 
              className="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 md:hover:bg-transparent rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>

            <NavDropdown 
              title="Soluções" 
              items={solutions}
              icon={<ChevronDown className="w-4 h-4" />}
            />

            <Link 
              to="/pricing" 
              className="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 md:hover:bg-transparent rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Planos
            </Link>
            
            <Link 
              to="/contact"
              className="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 md:hover:bg-transparent rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contato
            </Link>

            {/* Mobile-only login buttons */}
            <div className="md:hidden flex flex-col space-y-2 mt-4 pt-4 border-t border-white/10">
              <Link
                to="/login"
                className="px-3 py-2 text-center text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 text-center bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
                onClick={() => setIsOpen(false)}
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavMenu;