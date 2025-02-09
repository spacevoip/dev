import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useClickAway } from '../../hooks/useClickAway';
import { MenuItem } from './types';

interface NavDropdownProps {
  title: string;
  items: MenuItem[];
  icon?: React.ReactNode;
}

const NavDropdown = ({ title, items, icon }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useClickAway(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef} className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <span>{title}</span>
        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          {icon}
        </span>
      </button>

      {/* Dropdown panel */}
      <div className={`
        absolute z-50 left-0 mt-2 w-56
        bg-white/10 backdrop-blur-xl
        border border-white/20 rounded-xl
        shadow-xl
        transform transition-all duration-200 ease-in-out
        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
      `}>
        <div className="p-2">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.icon && <item.icon className="w-5 h-5 text-secondary-light" />}
              <div>
                <div className="text-white font-medium">{item.name}</div>
                {item.description && (
                  <p className="text-sm text-white/70">{item.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavDropdown;