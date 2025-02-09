export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatExtension = (channel: string): string => {
  if (!channel) return '';
  
  // Extrai o número do ramal do canal (ex: "SIP/1234-000" -> "1234")
  const match = channel.match(/SIP\/(\d+)/);
  return match ? match[1] : channel;
};

export const formatCallStatus = (disposition: string): string => {
  if (!disposition) return 'Unknown';

  switch (disposition.toLowerCase()) {
    case 'answered':
      return 'Atendida';
    case 'no answer':
      return 'Não Atendida';
    case 'busy':
      return 'Ocupado';
    case 'failed':
      return 'Falhou';
    default:
      return disposition;
  }
};

export const formatDateTime = (date: Date): string => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
};

export function formatDurationTotal(seconds: number) {
  if (!seconds) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}