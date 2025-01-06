import { supabase } from '../lib/supabase';

// Gera um número de 4 dígitos
export function generateExtensionNumber(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Verifica se um número já existe no banco
export async function isExtensionNumberUnique(number: string): Promise<boolean> {
  const { data } = await supabase
    .from('extensions')
    .select('numero')
    .eq('numero', number)
    .eq('status', 'ativo')
    .single();
  
  return !data; // retorna true se não existir
}

// Gera um número único de ramal
export async function generateUniqueExtensionNumber(): Promise<string> {
  let number = generateExtensionNumber();
  let isUnique = await isExtensionNumberUnique(number);
  
  // Tenta até 10 vezes para evitar loop infinito
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    number = generateExtensionNumber();
    isUnique = await isExtensionNumberUnique(number);
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Não foi possível gerar um número único');
  }
  
  return number;
}
