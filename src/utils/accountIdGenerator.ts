/**
 * Gera um accountid no formato SPCVOIPXXXX onde XXXX é um número sequencial
 * @param lastAccountId - Último accountid usado (opcional)
 * @returns Novo accountid no formato SPCVOIPXXXX
 */
export const generateAccountId = (lastAccountId?: string): string => {
  const prefix = 'SPCVOIP';
  const numberLength = 4;

  if (!lastAccountId) {
    // Se não houver último accountid, começa do 0001
    return `${prefix}0001`;
  }

  // Extrai o número do último accountid
  const lastNumber = parseInt(lastAccountId.replace(prefix, ''), 10);
  
  // Incrementa o número e formata com zeros à esquerda
  const nextNumber = (lastNumber + 1).toString().padStart(numberLength, '0');
  
  return `${prefix}${nextNumber}`;
};

/**
 * Valida se um accountid está no formato correto SPCVOIPXXXX
 * @param accountId - AccountId para validar
 * @returns true se o formato estiver correto
 */
export const isValidAccountId = (accountId: string): boolean => {
  const accountIdRegex = /^SPCVOIP\d{4}$/;
  return accountIdRegex.test(accountId);
};

/**
 * Formata um número para o formato de accountid SPCVOIPXXXX
 * @param number - Número para formatar
 * @returns AccountId formatado
 */
export const formatAccountId = (number: number): string => {
  return `SPCVOIP${number.toString().padStart(4, '0')}`;
};
