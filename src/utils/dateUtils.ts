// Função para obter os dias de validade baseado no plano
export const getValidityDays = (plano: string | number): number => {
  // Se plano for um número, retornar diretamente
  if (typeof plano === 'number') {
    return plano;
  }

  // Se plano for undefined ou null, retornar padrão
  if (!plano) {
    return 30;
  }

  const planoNormalizado = plano.toLowerCase().trim();
  switch (planoNormalizado) {
    case 'sip trial':
      return 1;
    case 'sip basico':
      return 20;
    case 'sip premium':
    case 'sip exclusive':
      return 25;
    default:
      return 30;
  }
};

// Interface para informações de vencimento
export interface ExpirationInfo {
  expirationDate: Date;
  isExpired: boolean;
  daysUntilExpiration: number;
  formattedDate: string;
  formattedDateTime: string;
  status: 'expired' | 'warning' | 'active';
  statusText: string;
  progressPercentage: number;
}

// Função para calcular o status de vencimento
export const calculateExpirationStatus = (createdAt: string, validity: number): ExpirationInfo => {
  // Obter a data atual sem as horas para comparação justa
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // Converter a data de criação e remover as horas
  const createdDate = new Date(createdAt);
  createdDate.setHours(0, 0, 0, 0);
  
  // Calcular a data de vencimento (data de criação + dias de validade - 1)
  // Subtraímos 1 porque o dia do cadastro conta como primeiro dia
  const expirationDate = new Date(createdDate);
  expirationDate.setDate(createdDate.getDate() + (validity - 1));
  expirationDate.setHours(23, 59, 59, 999); // Vence no final do dia
  
  // Calcular dias até o vencimento
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = now > expirationDate;
  
  // Calcular porcentagem de progresso
  const totalDays = validity;
  const daysElapsed = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

  // Determinar o status
  let status: 'expired' | 'warning' | 'active';
  let statusText: string;

  if (isExpired) {
    status = 'expired';
    const days = Math.abs(daysUntilExpiration);
    statusText = `Vencido há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  } else if (daysUntilExpiration <= 7) {
    status = 'warning';
    if (daysUntilExpiration === 0) {
      statusText = 'Vence hoje';
    } else if (daysUntilExpiration === 1) {
      statusText = 'Vence amanhã';
    } else {
      statusText = `Vence em ${daysUntilExpiration} dias`;
    }
  } else {
    status = 'active';
    statusText = `${daysUntilExpiration} dias restantes`;
  }

  return {
    expirationDate,
    isExpired,
    daysUntilExpiration,
    formattedDate: expirationDate.toLocaleDateString('pt-BR'),
    formattedDateTime: expirationDate.toLocaleString('pt-BR'),
    status,
    statusText,
    progressPercentage
  };
};

// Função para obter a classe CSS baseada no status de vencimento
export const getExpirationStatusClass = (info: ExpirationInfo): string => {
  switch (info.status) {
    case 'expired':
      return 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/20';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-600/20';
    default:
      return 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20';
  }
};

// Função para obter o texto do status de vencimento
export const getExpirationStatusText = (info: ExpirationInfo): string => {
  return info.statusText;
};
