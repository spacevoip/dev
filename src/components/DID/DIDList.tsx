import React from 'react';
import { Phone, Trash2 } from 'lucide-react';
import type { DIDCliente } from '../../types/didClientes';
import { formatCurrency } from '../../utils/format';

interface DIDListProps {
  dids: DIDCliente[];
}

export const DIDList: React.FC<DIDListProps> = ({ dids }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Número</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Destino</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Valor Mensal</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Última Chamada</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dids.map((did) => (
              <tr key={did.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-900">{did.numero}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{did.destino}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    did.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {did.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{formatCurrency(did.valor_mensal)}</span>
                    <span className="text-xs text-gray-500">por mês</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-500">
                    {did.ultima_chamada 
                      ? new Date(did.ultima_chamada).toLocaleString('pt-BR')
                      : 'Nunca'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};