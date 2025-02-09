import { supabase } from '../lib/supabase';

export async function getCallCount(accountId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('cdr')
      .select('*', { count: 'exact', head: true })
      .eq('accountid', accountId);

    if (error) {
      console.error('Error getting call count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error getting call count:', err);
    return 0;
  }
}
