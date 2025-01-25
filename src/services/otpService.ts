import { supabase } from '../lib/supabase';
import { checkPhoneExists } from './userService';

const API_URL = 'https://intermed.appinovavoip.com:5188/send-otp';
const API_TOKEN = '2dcd63c2-4fb1-4273-9e85-736eaaf4e0c5';

export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Verifica se o telefone já está cadastrado
    const exists = await checkPhoneExists(phoneNumber);
    if (exists) {
      return {
        success: false,
        message: 'Este número de telefone já está cadastrado. Para mais informações, entre em contato conosco pelo chat.'
      };
    }

    // Remove todos os caracteres não numéricos
    const formattedPhone = phoneNumber.replace(/\D/g, '');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({ phone_number: formattedPhone })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar código');
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erro ao enviar OTP:', error);
    return { success: false, message: 'Erro ao enviar código de verificação' };
  }
};

export const verifyOTP = async (phoneNumber: string, code: string): Promise<boolean> => {
  try {
    // Verifica se o telefone já está cadastrado
    const exists = await checkPhoneExists(phoneNumber);
    if (exists) {
      // toast.error('Este número de telefone já está cadastrado. Para mais informações, entre em contato conosco pelo chat.');
      return false;
    }

    // Remove todos os caracteres não numéricos
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Busca primeiro sem o +55
    let { data, error } = await supabase
      .from('otp_verification')
      .select('otp, id')
      .eq('phone_number', cleanPhone)
      .order('created_at', { ascending: false })
      .limit(1);

    // Se não encontrar, tenta com o +55
    if (!data?.length) {
      const phoneWithPrefix = `+55${cleanPhone}`;
      ({ data, error } = await supabase
        .from('otp_verification')
        .select('otp, id')
        .eq('phone_number', phoneWithPrefix)
        .order('created_at', { ascending: false })
        .limit(1));
    }

    if (error) throw error;
    
    // Verifica se encontrou algum registro e se o código corresponde
    const isValid = data?.[0]?.otp === code;

    // Se o código for válido, marca o número como verificado
    if (isValid && data?.[0]?.id) {
      const { error: updateError } = await supabase
        .from('otp_verification')
        .update({ verified: true })
        .eq('id', data[0].id);

      if (updateError) throw updateError;
    }

    return isValid;
  } catch (error) {
    console.error('Erro ao verificar OTP:', error);
    return false;
  }
};
