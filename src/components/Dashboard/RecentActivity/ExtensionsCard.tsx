import { Phone, User } from "lucide-react";
import { useExtensions } from "../../../hooks/useExtensions";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

interface Extension {
  id: string;
  ramal: string;
  nome: string;
  email: string;
  departamento: string;
  created_at?: string;
  caller_id?: string;
  numero?: string;
  snystatus?: string;
}

export const ExtensionsCard = () => {
  const { data: extensions = [], isLoading: isLoadingExtensions } = useExtensions();
  const [extensionsWithNumbers, setExtensionsWithNumbers] = useState<Extension[]>([]);

  // Pega os 4 ramais mais recentes
  const recentExtensions = useMemo(() => {
    return [...extensions]
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4);
  }, [extensions]);

  // Busca números e status das extensions
  useEffect(() => {
    const loadExtensionNumbers = async () => {
      if (!recentExtensions.length) return;

      try {
        const { data: extensionsData } = await supabase
          .from('extensions')
          .select('id, numero, snystatus')
          .in('id', recentExtensions.map(ext => ext.id));

        // Combina os dados
        const updatedExtensions = recentExtensions.map(ext => {
          const extensionData = extensionsData?.find(e => e.id === ext.id);
          return {
            ...ext,
            numero: extensionData?.numero,
            snystatus: extensionData?.snystatus
          };
        });

        setExtensionsWithNumbers(updatedExtensions);
      } catch (error) {
        console.error('Erro ao carregar dados dos ramais:', error);
      }
    };

    loadExtensionNumbers();

    // Atualiza o status a cada 5 segundos
    const interval = setInterval(loadExtensionNumbers, 5000);
    return () => clearInterval(interval);
  }, [recentExtensions]);

  const getStatusBadge = (extension: Extension) => {
    const status = extension.snystatus || 'Offline';
    let color = 'bg-gray-500';

    if (status === 'Online (Livre)') {
      color = 'bg-green-500';
    } else if (status === 'Chamando') {
      color = 'bg-orange-500';
    } else if (status === 'Em Chamada') {
      color = 'bg-blue-500';
    }

    return (
      <Badge variant="secondary" className={`${color} text-white`}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Ramais Recentes
        </CardTitle>
        <CardDescription>
          Status dos últimos ramais cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoadingExtensions ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {extensionsWithNumbers.map((extension) => (
                <div key={extension.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{extension.nome || 'Sem nome'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Ramal: {extension.numero || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(extension)}
                  </div>
                </div>
              ))}
              {extensionsWithNumbers.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  Nenhum ramal cadastrado
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
