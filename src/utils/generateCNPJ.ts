function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateCheckDigit(numbers: number[]): number {
  const multipliers = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < multipliers.length; i++) {
    sum += numbers[i] * multipliers[i];
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function generateCNPJ(): string {
  // Gera os 8 primeiros dígitos (base)
  const base = Array.from({ length: 8 }, () => generateRandomNumber(0, 9));
  
  // Adiciona os 4 dígitos da filial (geralmente 0001)
  const branch = [0, 0, 0, 1];
  
  const numbers = [...base, ...branch];
  
  // Calcula o primeiro dígito verificador
  const firstDigit = calculateCheckDigit(numbers);
  numbers.push(firstDigit);
  
  // Calcula o segundo dígito verificador
  const secondDigit = calculateCheckDigit(numbers);
  numbers.push(secondDigit);
  
  // Formata o CNPJ
  const cnpj = numbers.join('');
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
}
