import { supabase } from '../lib/supabase';

export const checkPhoneExists = async (phoneNumber: string): Promise<boolean> => {
  try {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Busca primeiro sem o +55
    let { data, error } = await supabase
      .from('otp_verification')
      .select('id')
      .eq('phone_number', cleanPhone)
      .eq('verified', true)  // Apenas números verificados
      .limit(1);

    // Se não encontrar, tenta com o +55
    if (!data?.length) {
      const phoneWithPrefix = `+55${cleanPhone}`;
      ({ data, error } = await supabase
        .from('otp_verification')
        .select('id')
        .eq('phone_number', phoneWithPrefix)
        .eq('verified', true)  // Apenas números verificados
        .limit(1));
    }

    if (error) throw error;
    
    return data?.length > 0;
  } catch (error) {
    console.error('Erro ao verificar telefone:', error);
    throw error;
  }
};
