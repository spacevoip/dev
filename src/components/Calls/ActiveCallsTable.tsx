import React from 'react';
import { useActiveCalls } from '../../hooks/useActiveCalls';
import { useAuth } from '../../contexts/AuthContext';

export function ActiveCallsTable() {
  const { data: calls = [], isLoading, error } = useActiveCalls();
  const { user } = useAuth();

  if (isLoading) {
    return <div className="text-center py-4">Carregando chamadas...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Erro ao carregar chamadas</div>;
  }

  if (!calls.length) {
    return <div className="text-center py-4">Nenhuma chamada ativa no momento</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ramal
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Caller ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duração
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {calls.map((call) => (
            <tr key={call.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.ramal}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.callerid}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.duracao}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  call.status === 'Chamando' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {call.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
