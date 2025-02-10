import { supabase } from '../lib/supabase';
import { checkPhoneExists } from './userService';
import { toast } from 'sonner';

// Em produção usa a URL completa, em dev usa o proxy
const API_URL = import.meta.env.PROD 
  ? 'https://intermed.appinovavoip.com:5188/send-otp'
  : '/send-otp';

const API_TOKEN = '2dcd63c2-4fb1-4273-9e85-736eaaf4e0c5';  // Token fixo da API

export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Log para debug em produção
    console.log('Iniciando envio de OTP para:', phoneNumber);
    console.log('API URL:', API_URL);
    console.log('Ambiente:', import.meta.env.PROD ? 'Produção' : 'Desenvolvimento');

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
    console.log('Telefone formatado:', formattedPhone);

    // Prepara o corpo da requisição
    const requestBody = { phone_number: formattedPhone };
    console.log('Request body:', requestBody);

    // Tenta fazer a requisição usando fetch para melhor compatibilidade com o proxy
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Se a resposta não for ok, lança um erro com mais detalhes
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    // Tenta fazer o parse do JSON apenas se houver conteúdo
    const text = await response.text();
    console.log('Response text:', text);

    if (!text) {
      console.log('Resposta vazia recebida, considerando sucesso');
      return { success: true, message: 'Código enviado com sucesso' };
    }

    try {
      const data = JSON.parse(text);
      if (!data) {
        throw new Error('Empty JSON response');
      }
      return { success: true, message: data.message || 'Código enviado com sucesso' };
    } catch (parseError) {
      console.error('Failed to parse API response:', text, parseError);
      // Se o status for 200, considera sucesso mesmo com erro de parse
      if (response.status === 200) {
        return { success: true, message: 'Código enviado com sucesso' };
      }
      return { success: false, message: 'Erro ao processar resposta do servidor' };
    }

  } catch (error) {
    console.error('Erro geral no sendOTP:', error);
    // Verifica se é um erro de rede ou CORS
    if (error instanceof TypeError) {
      if (error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          message: 'Erro de conexão com o servidor. Por favor, verifique sua internet e tente novamente.'
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
