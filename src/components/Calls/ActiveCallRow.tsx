import { Phone, PhoneOff, PhoneForwarded, MicOff, Search } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useCallDuration } from '../../hooks/useCallDuration';
import { AgentActiveCall } from '../../hooks/useAgentActiveCalls';
import { ConsultaCampanhaModal } from './ConsultaCampanhaModal';
import { useState } from 'react';

interface ActiveCallRowProps {
  call: AgentActiveCall;
  formatDuration: (duration: string | number) => string;
  onHangup?: (channel: string) => void;
  onTransfer?: (channel: string) => void;
  onMute?: (channel: string) => void;
}

export function ActiveCallRow({ call, formatDuration, onHangup, onTransfer, onMute }: ActiveCallRowProps) {
  const [isConsultaModalOpen, setIsConsultaModalOpen] = useState(false);
  const channelParts = call.Channel.split('/');
  const ramal = channelParts[1]?.split('-')[0] || 'N/A';
  const destino = call.Extension || 'N/A';
  const duration = useCallDuration(call.Duration);

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span>{call.CallerID || 'Desconhecido'}</span>
          </div>
        </td>
        <td className="py-3 px-4">{ramal}</td>
        <td className="py-3 px-4">{destino}</td>
        <td className="py-3 px-4">
          <Badge
            className={
              call.State === 'Up'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }
          >
            {call.State === 'Up' ? 'Ativa' : call.State}
          </Badge>
        </td>
        <td className="py-3 px-4">
          <span className="font-medium">{formatDuration(duration)}</span>
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onHangup?.(call.Channel)}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onTransfer?.(call.Channel)}
            >
              <PhoneForwarded className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onMute?.(call.Channel)}
            >
              <MicOff className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsConsultaModalOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>

      <ConsultaCampanhaModal
        isOpen={isConsultaModalOpen}
        onClose={() => setIsConsultaModalOpen(false)}
        phoneNumber={destino}
      />
    </>
  );
}
