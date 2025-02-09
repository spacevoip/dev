import { supabase } from '../lib/supabase';
import { checkPhoneExists } from './userService';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_INTERMED_API_URL + '/send-otp';
const API_TOKEN = import.meta.env.VITE_OTP_API_TOKEN;

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
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({ phone_number: formattedPhone })
    });

    // Se a resposta não for ok, lança um erro com mais detalhes
    if (!response.ok) {
      const errorDetail = await response.text().catch(() => 'No error details available');
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetail}`);
    }

    // Tenta fazer o parse do JSON apenas se houver conteúdo
    const text = await response.text();
    if (!text) {
      console.error('API returned empty response');
      return { success: false, message: 'Erro ao enviar código: resposta vazia do servidor' };
    }

    try {
      const data = JSON.parse(text);
      if (!data) {
        throw new Error('Empty JSON response');
      }
      return { success: true, message: data.message || 'Código enviado com sucesso' };
    } catch (parseError) {
      console.error('Failed to parse API response:', text, parseError);
      return { success: false, message: 'Erro ao processar resposta do servidor' };
    }

  } catch (error) {
    console.error('Erro ao enviar OTP:', error);
    // Verifica se é um erro de rede ou CORS
    if (error instanceof TypeError) {
      if (error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          message: 'Erro de conexão com o servidor. Por favor, verifique sua internet e tente novamente.'
        };
      } else if (error.message.includes('CORS')) {
        return {
          success: false,
          message: 'Erro de acesso ao servidor. Por favor, tente novamente em alguns instantes.'
        };
      }
    }
    return { 
      success: false, 
      message: 'Erro ao enviar código de verificação. Por favor, tente novamente em alguns instantes.'
    };
  }
};

export const verifyOTP = async (phoneNumber: string, code: string): Promise<boolean> => {
  try {
    // Verifica se o telefone já está cadastrado
    const exists = await checkPhoneExists(phoneNumber);
    if (exists) {
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
