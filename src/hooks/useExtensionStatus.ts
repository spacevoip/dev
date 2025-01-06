import { useState, useEffect } from 'react';
import { ExtensionStatusResponse } from '../types/extensionStatus';

interface ExtensionStatus {
  agent_name: string;
  in_call: boolean;
  ramal: string;
  status: string;
}

interface ExtensionStatusResponse {
  extensions: ExtensionStatus[];
}

export const useExtensionStatus = () => {
  const [extensionStatuses, setExtensionStatuses] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchExtensionStatus = async () => {
    try {
      const response = await fetch('https://api.appinovavoip.com/list-extensions', {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch extension status');
      }
      
      const data: ExtensionStatusResponse = await response.json();
      
      // Criar um objeto com o número do ramal como chave e o status como valor
      const statusMap = data.extensions.reduce((acc, ext) => {
        acc[ext.ramal] = ext.status;
        return acc;
      }, {} as Record<string, string>);
      
      setExtensionStatuses(statusMap);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch extension status');
    }
  };

  useEffect(() => {
    // Buscar status inicial
    fetchExtensionStatus();

    // Configurar intervalo para atualizar a cada 5 segundos
    const intervalId = setInterval(fetchExtensionStatus, 5000);

    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, []);

  return {
    extensionStatuses,
    error,
    fetchExtensionStatus
  };
};
