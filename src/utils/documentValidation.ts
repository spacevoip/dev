// Validação de CPF
const isValidCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
};

// Validação de CNPJ
const isValidCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Validação do primeiro dígito verificador
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  // Validação do segundo dígito verificador
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

// Formata CPF: 000.000.000-00
const formatCPF = (cpf: string): string => {
  cpf = cpf.replace(/\D/g, '');
  return cpf
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// Formata CNPJ: 00.000.000/0000-00
const formatCNPJ = (cnpj: string): string => {
  cnpj = cnpj.replace(/\D/g, '');
  return cnpj
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

// Função principal que valida e formata CPF/CNPJ
export const validateAndFormatDocument = (document: string): {
  isValid: boolean;
  formatted: string;
  type: 'CPF' | 'CNPJ' | null;
} => {
  // Remove caracteres não numéricos
  const numbers = document.replace(/\D/g, '');

  // Verifica se é CPF (11 dígitos)
  if (numbers.length === 11) {
    const isValid = isValidCPF(numbers);
    return {
      isValid,
      formatted: isValid ? formatCPF(numbers) : document,
      type: 'CPF'
    };
  }

  // Verifica se é CNPJ (14 dígitos)
  if (numbers.length === 14) {
    const isValid = isValidCNPJ(numbers);
    return {
      isValid,
      formatted: isValid ? formatCNPJ(numbers) : document,
      type: 'CNPJ'
    };
  }

  // Se não for nem CPF nem CNPJ
  return {
    isValid: false,
    formatted: document,
    type: null
  };
};
