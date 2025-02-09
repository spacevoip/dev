import React from 'react';
import { Search } from 'lucide-react';
import { useMenuSearch } from '../../hooks/useMenuSearch';
import * as LucideIcons from 'lucide-react';

export const SearchMenu = () => {
  const {
    searchTerm,
    setSearchTerm,
    isSearching,
    setIsSearching,
    filteredItems,
    handleSelectItem
  } = useMenuSearch();

  // Função para obter o ícone do Lucide dinamicamente
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return <Icon className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="search"
          placeholder="Buscar funções..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearching(true)}
          className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Menu de resultados */}
      {isSearching && filteredItems.length > 0 && (
        <div className="absolute mt-2 w-[300px] bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 max-h-[400px] overflow-y-auto">
          {filteredItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleSelectItem(item.path)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-start gap-3"
            >
              {getIcon(item.icon || 'Circle')}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay para fechar o menu ao clicar fora */}
      {isSearching && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsSearching(false)}
        />
      )}
    </div>
  );
};
