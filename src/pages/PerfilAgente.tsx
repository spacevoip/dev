import { Card } from "@/components/ui/card";
import { useAgent } from "@/contexts/AgentContext";
import { AgentLayout } from "@/components/Agent/AgentLayout";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Hash, Shield, Signal } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export function PerfilAgente() {
  usePageTitle('Perfil do Agente');
  const { agent } = useAgent();

  return (
    <AgentLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b">
            <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center">
              <User className="h-6 w-6 text-primary/70" />
            </div>
            <div>
              <h1 className="text-xl font-medium">{agent?.nome || 'Nome não definido'}</h1>
              <p className="text-sm text-muted-foreground">Agente {agent?.numero}</p>
            </div>
          </div>

          {/* Informações */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* CallerID */}
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">CallerID</p>
                <p className="font-medium">{agent?.callerid || 'Não definido'}</p>
              </div>
            </div>

            {/* Ramal */}
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ramal</p>
                <p className="font-medium">{agent?.numero || 'Não definido'}</p>
              </div>
            </div>

            {/* Administrador */}
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Administrador</p>
                <p className="font-medium">{agent?.username || 'Não definido'}</p>
              </div>
            </div>

            {/* Status SIP */}
            <div className="flex items-center gap-3">
              <Signal className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Status SIP</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {agent?.snystatus === 'Online (Livre)' ? 'Online (Livre)' : 
                     agent?.snystatus === 'Em Chamada' ? 'Em Chamada' : 
                     'Offline'}
                  </p>
                  <Badge 
                    variant="outline"
                    className={`text-xs px-1.5 ${
                      agent?.snystatus === 'Online (Livre)'
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : agent?.snystatus === 'Em Chamada'
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                    }`}
                  >
                    {agent?.snystatus === 'Online (Livre)' ? 'Online' : 
                     agent?.snystatus === 'Em Chamada' ? 'Em Chamada' : ''}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AgentLayout>
  );
}
