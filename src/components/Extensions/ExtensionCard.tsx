import React from 'react';
import { Phone } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ExtensionActions } from './ExtensionActions';
import type { Extension } from '../../types';

interface ExtensionCardProps {
  extension: Extension;
  onEdit: (extension: Extension) => void;
  onDelete: (id: string) => void;
}

export const ExtensionCard: React.FC<ExtensionCardProps> = ({
  extension,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">{extension.name}</h3>
            <p className="text-sm text-gray-600">Ramal: {extension.number}</p>
          </div>
        </div>
        <StatusBadge status={extension.status} />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Caller ID: {extension.callerId || '-'}
          </p>
          <div className="flex items-center">
            <ExtensionActions
              onEdit={() => onEdit(extension)}
              onDelete={() => onDelete(extension.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};