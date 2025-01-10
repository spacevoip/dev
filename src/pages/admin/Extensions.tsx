import { useEffect, useState } from "react";
import { useAdminSupabaseQuery } from "../../hooks/useAdminSupabaseQuery";
import { Badge } from "../../components/ui/badge";
import { Loader2 } from "lucide-react";

interface Extension {
  id: string;
  ramal: string;
  name: string;
  email: string;
  departamento: string;
  created_at: string;
}

interface RamalStatus {
  ramal: string;
  status: string;
}

export function AdminExtensions() {
  const [extensionsStatus, setExtensionsStatus] = useState<RamalStatus[]>([]);

  const { data: extensions, loading, error } = useAdminSupabaseQuery<Extension>({
    table: "extensions",
    orderBy: "created_at",
  });

  // Função para buscar o status dos ramais
  const fetchRamaisStatus = async (ramais: string[]) => {
    try {
      const ramaisStr = ramais.join(',');
      const response = await fetch(
        `https://intermed.appinovavoip.com:3000/ramais?ramal=${ramaisStr}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': '191e8a1e-d313-4e12-b608-d1a759b1a106'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const statusData = data.map((item: any) => ({
        ramal: item.ramal,
        status: item.status
      }));
      setExtensionsStatus(statusData);
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    }
  };

  // Efeito para buscar o status dos ramais
  useEffect(() => {
    if (extensions && extensions.length > 0) {
      const ramais = extensions.map(ext => ext.ramal);
      fetchRamaisStatus(ramais);

      // Atualiza a cada 5 segundos
      const interval = setInterval(() => {
        fetchRamaisStatus(ramais);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [extensions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Erro ao carregar extensões: {error}
        </div>
      </div>
    );
  }

  if (!extensions || extensions.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
          Nenhuma extensão encontrada.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">EXTENSION</th>
                <th className="p-4 text-left">NAME</th>
                <th className="p-4 text-left">EMAIL</th>
                <th className="p-4 text-left">DEPARTMENT</th>
                <th className="p-4 text-left">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {extensions.map((extension) => {
                const status = extensionsStatus.find(s => s.ramal === extension.ramal);
                
                let badgeColor = 'bg-gray-500';
                let statusText = 'Offline';
                
                if (status?.status?.includes('Online')) {
                  badgeColor = 'bg-green-500';
                  statusText = status.status;
                }

                return (
                  <tr key={extension.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{extension.ramal}</td>
                    <td className="p-4">{extension.name}</td>
                    <td className="p-4">{extension.email}</td>
                    <td className="p-4">{extension.departamento}</td>
                    <td className="p-4">
                      <Badge className={`${badgeColor} text-white`}>
                        {statusText}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
