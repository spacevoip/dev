import { supabase } from '../lib/supabase';

export interface Extension {
  id: string;
  numero: string;
  nome: string;
  accountid: string;
}

export async function fetchExtensions(accountId: string): Promise<Extension[]> {
  try {
    console.log('Fetching extensions for accountId:', accountId);
    const { data, error } = await supabase
      .from('extensions')
      .select('id, numero, nome, accountid')
      .eq('accountid', accountId);

    if (error) {
      console.error('Error fetching extensions:', error);
      throw error;
    }

    console.log('Extensions fetched:', data);
    return data || [];
  } catch (err) {
    console.error('Error in fetchExtensions:', err);
    throw err;
  }
}
