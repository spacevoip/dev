import { useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface PaymentResponse {
  QRCode: string;
  QRCodeLink: string;
  QRCodeText: string;
  txid: string;
}

export function usePayments() {
  const [loading, setLoading] = useState(false);

  const createPayment = async ({ plano, accountid, valor }: { plano: string; accountid: string; valor: number }) => {
    try {
      setLoading(true);
      const response = await axios.post<PaymentResponse>(
        'https://api.appinovavoip.com/criar-pagamento',
        { plano, accountid, valor },
        {
          headers: {
            'x-api-key': 'f567bda4-b0a6-4433-9574-69a921dcdba0'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast.error('Erro ao gerar pagamento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (accountid: string, plano: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ plano })
        .eq('accountid', accountid);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao atualizar plano:', err);
      return false;
    }
  };

  const checkPaymentStatus = async (txid: string) => {
    try {
      // Apenas monitora se existe o txid na tabela pagamentos
      const { data, error } = await supabase
        .from('pagamentos')
        .select()
        .eq('txid', txid)
        .limit(1);

      if (error) {
        console.error('Erro ao verificar pagamento:', error);
        return null;
      }

      // Se encontrou o pagamento, retorna os dados
      if (data && data.length > 0) {
        const payment = data[0];
        // Atualiza o plano do usuário
        const planUpdated = await updateUserPlan(payment.accountid, payment.plano);
        if (!planUpdated) {
          console.error('Erro ao atualizar plano do usuário');
          return null;
        }
        return payment;
      }

      return null;
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      return null;
    }
  };

  return {
    createPayment,
    checkPaymentStatus,
    loading
  };
}
