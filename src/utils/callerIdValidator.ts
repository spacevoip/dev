/**
 * Remove todos os caracteres não numéricos do callerID
 */
export const sanitizeCallerId = (callerId: string): string => {
  return callerId.replace(/[^0-9]/g, '');
};

/**
 * Valida se o callerID contém apenas números
 */
export const isValidCallerId = (callerId: string): boolean => {
  return /^[0-9]+$/.test(callerId);
};
