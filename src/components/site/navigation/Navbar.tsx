import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollPosition } from '../hooks/useScrollPosition';
import Logo from './Logo';
import NavMenu from './navigation/NavMenu';

const Navbar = () => {
  const scrollPosition = useScrollPosition();
  const isScrolled = scrollPosition > 50;

  return (
    <>
      {/* Placeholder div to prevent content jump when navbar becomes fixed */}
      <div className="h-24" /> {/* Increased from h-16 to h-24 */}
      
      <header className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled ? 'bg-primary/95 backdrop-blur-lg shadow-lg py-2' : 'bg-transparent py-2'} 
      `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Logo />
            </Link>

            <NavMenu />

            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login"
                className="px-4 py-2 text-white/90 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;