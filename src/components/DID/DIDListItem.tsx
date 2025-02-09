import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import type { DIDNumber } from '../../types';

interface DIDListItemProps {
  did: DIDNumber;
}

export const DIDListItem: React.FC<DIDListItemProps> = ({ did }) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-medium">{did.number}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        Ramal {did.destination}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          did.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {did.status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {formatCurrency(did.monthlyPrice)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {did.lastCall.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => {}}
          className="text-indigo-600 hover:text-indigo-900 mr-3"
        >
          <Edit2 className="h-5 w-5" />
        </button>
        <button
          onClick={() => {}}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};