import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  render?: (value: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  onRowClick
}) => {
  // Filtrar colunas por prioridade baseado no tamanho da tela
  const visibleColumns = columns.filter(col => {
    if (typeof window === 'undefined') return col.priority === 'high';
    const width = window.innerWidth;
    if (width < 640) return col.priority === 'high';
    if (width < 1024) return ['high', 'medium'].includes(col.priority);
    return true;
  });

  return (
    <div className="overflow-x-auto">
      {/* Versão Desktop */}
      <table className="hidden md:table min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {visibleColumns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {column.render ? column.render(row[column.key]) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Versão Mobile - Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            onClick={() => onRowClick?.(row)}
            className={`bg-white rounded-lg shadow p-4 space-y-2 ${
              onRowClick ? 'cursor-pointer active:bg-gray-50' : ''
            }`}
          >
            {columns
              .filter(col => col.priority === 'high')
              .map((column) => (
                <div key={column.key} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    {column.title}
                  </span>
                  <span className="text-sm text-gray-900">
                    {column.render ? column.render(row[column.key]) : row[column.key]}
                  </span>
                </div>
              ))}
            
            {/* Botão para expandir detalhes */}
            {onRowClick && (
              <div className="flex justify-end mt-2">
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
