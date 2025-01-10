import React from 'react';
import { useExtensionStatus } from '../../hooks/useExtensionStatus';

interface ExtensionStatusProps {
  numero: string;
  onStatusChange?: (status: string) => void;
}

export const ExtensionStatus: React.FC<ExtensionStatusProps> = ({ numero, onStatusChange }) => {
  const { data: statusData } = useExtensionStatus(numero);
  const status = statusData?.status || 'unknown';

  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  return (
    <span className={`status-badge ${status.replace(' ', '-')}`}>
      {status}
    </span>
  );
};
