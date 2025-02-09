import { supabase } from '../lib/supabase';
import { checkPhoneExists } from './userService';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_INTERMED_API_URL + '/send-otp';
const API_TOKEN = import.meta.env.VITE_OTP_API_TOKEN;

export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Log para debug em produção
    console.log('Iniciando envio de OTP para:', phoneNumber);
    console.log('API URL:', API_URL);

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

    // Tenta fazer a requisição usando XMLHttpRequest para debug
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', API_URL, true);
      
      // Headers
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${API_TOKEN}`);
      xhr.setRequestHeader('Accept', 'application/json');
      
      // Logs de estado
      xhr.onreadystatechange = function() {
        console.log('XHR State:', xhr.readyState);
        if (xhr.readyState === 4) {
          console.log('Status:', xhr.status);
          console.log('Response:', xhr.responseText);
          console.log('Response Headers:', xhr.getAllResponseHeaders());
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              if (!xhr.responseText) {
                console.log('Resposta vazia recebida');
                resolve({
                  success: true,
                  message: 'Código enviado com sucesso'
                });
                return;
              }

              const data = JSON.parse(xhr.responseText);
              resolve({
                success: true,
                message: data.message || 'Código enviado com sucesso'
              });
            } catch (parseError) {
              console.error('Erro ao fazer parse da resposta:', parseError);
              console.log('Resposta raw:', xhr.responseText);
              // Se não conseguir fazer o parse mas o status for 200, considera sucesso
              if (xhr.status === 200) {
                resolve({
                  success: true,
                  message: 'Código enviado com sucesso'
                });
              } else {
                resolve({
                  success: false,
                  message: 'Erro ao processar resposta do servidor'
                });
              }
            }
          } else {
            console.error('Erro HTTP:', xhr.status, xhr.statusText);
            resolve({
              success: false,
              message: `Erro ao enviar código (${xhr.status}). Por favor, tente novamente.`
            });
          }
        }
      };

      // Error handler
      xhr.onerror = function(e) {
        console.error('XHR Error:', e);
        resolve({
          success: false,
          message: 'Erro de conexão com o servidor. Por favor, tente novamente.'
        });
      };

      // Envia a requisição
      try {
        xhr.send(JSON.stringify(requestBody));
      } catch (sendError) {
        console.error('Erro ao enviar requisição:', sendError);
        resolve({
          success: false,
          message: 'Erro ao enviar requisição. Por favor, tente novamente.'
        });
      }
    });

  } catch (error) {
    console.error('Erro geral no sendOTP:', error);
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
