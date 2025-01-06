import React from 'react';
import { ExtensionNumber } from './ExtensionNumber';
import { StatusBadge } from './StatusBadge';
import { ExtensionActions } from './ExtensionActions';
import type { Extension } from '../../types';

interface ExtensionTableRowProps {
  extension: Extension;
  onEdit: (extension: Extension) => void;
  onDelete: (id: string) => void;
}

export const ExtensionTableRow: React.FC<ExtensionTableRowProps> = ({
  extension,
  onEdit,
  onDelete,
}) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <ExtensionNumber number={extension.number} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{extension.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
        {extension.callerId || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={extension.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <ExtensionActions
          onEdit={() => onEdit(extension)}
          onDelete={() => onDelete(extension.id)}
        />
      </td>
    </tr>
  );
};