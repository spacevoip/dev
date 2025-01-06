import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ActiveCall } from '../types/activeCalls';

interface DatabaseActiveCall {
  id?: string;
  ramal: string;
  callerid: string;
  duracao: string;
  destino: string;
  status: string;
  channel: string;
  application: string;
  created_at?: string;
}

export const useActiveCallsDatabase = (activeCalls: ActiveCall[]) => {
  useEffect(() => {
    const syncCallsWithDatabase = async () => {
      try {
        // 1. Buscar todas as chamadas ativas do banco
        const { data: existingCalls, error: fetchError } = await supabase
          .from('activecalls')
          .select('*')
          .filter('ramal', '!=', '')
          .filter('channel', 'not ilike', 'PJSIP/tronco-out-%');

        if (fetchError) throw fetchError;

        // 2. Mapear as chamadas atuais para o formato do banco
        // Filtramos apenas chamadas com ramal e que não são de tronco
        const currentCalls: DatabaseActiveCall[] = activeCalls
          .filter(call => {
            const hasRamal = call.Ramal && call.Ramal.trim() !== '';
            const isInternalChannel = call.Channel?.includes('PJSIP/tronco-out-') === false;
            return hasRamal && isInternalChannel;
          })
          .filter((call, index, self) => 
            index === self.findIndex((c) => c.Channel === call.Channel)
          )
          .map(call => ({
            ramal: call.Ramal || '',
            callerid: call.CallerID,
            duracao: call.Duration,
            destino: call.Extension,
            status: call.State,
            channel: call.Channel,
            application: call.Application
          }));

        // 3. Identificar chamadas que precisam ser removidas (terminadas)
        const callsToRemove = existingCalls?.filter(existingCall =>
          !currentCalls.some(currentCall => currentCall.channel === existingCall.channel)
        );

        // 4. Identificar novas chamadas que precisam ser adicionadas
        const callsToAdd = currentCalls.filter(currentCall =>
          !existingCalls?.some(existingCall => existingCall.channel === currentCall.channel)
        );

        // 5. Identificar chamadas que precisam ser atualizadas
        const callsToUpdate = currentCalls.filter(currentCall =>
          existingCalls?.some(existingCall => 
            existingCall.channel === currentCall.channel &&
            (existingCall.duracao !== currentCall.duracao ||
             existingCall.status !== currentCall.status ||
             existingCall.application !== currentCall.application ||
             existingCall.ramal !== currentCall.ramal)
          )
        );

        // 6. Executar as operações no banco
        const promises = [];

        // Remover chamadas terminadas
        if (callsToRemove?.length) {
          promises.push(
            supabase
              .from('activecalls')
              .delete()
              .in('channel', callsToRemove.map(call => call.channel))
          );
        }

        // Adicionar novas chamadas
        if (callsToAdd.length) {
          promises.push(
            supabase
              .from('activecalls')
              .insert(callsToAdd)
          );
        }

        // Atualizar chamadas existentes
        for (const call of callsToUpdate) {
          promises.push(
            supabase
              .from('activecalls')
              .update({
                duracao: call.duracao,
                status: call.status,
                application: call.application,
                ramal: call.ramal
              })
              .eq('channel', call.channel)
          );
        }

        // Executar todas as operações
        if (promises.length) {
          await Promise.all(promises);
        }

      } catch (error) {
        console.error('Erro ao sincronizar chamadas com o banco:', error);
      }
    };

    syncCallsWithDatabase();
  }, [activeCalls]);
};
