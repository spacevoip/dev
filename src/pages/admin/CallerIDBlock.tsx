import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Ban } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface CallerIDBlock {
  id: string;
  created_at: string;
  callerid: string;
}

export const AdminCallerIDBlock = () => {
  const [callerIDs, setCallerIDs] = useState<CallerIDBlock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCallerIDs, setNewCallerIDs] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCallerIDs = async () => {
    const { data, error } = await supabase
      .from('calleridblack')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching caller IDs:', error);
      return;
    }

    setCallerIDs(data || []);
  };

  useEffect(() => {
    fetchCallerIDs();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('calleridblack')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting caller ID:', error);
      return;
    }

    await fetchCallerIDs();
  };

  const handleSave = async () => {
    setLoading(true);
    const numbers = newCallerIDs.split(',').map(n => n.trim()).filter(n => n);

    try {
      const { error } = await supabase
        .from('calleridblack')
        .insert(numbers.map(callerid => ({ callerid })));

      if (error) throw error;

      setIsModalOpen(false);
      setNewCallerIDs('');
      await fetchCallerIDs();
    } catch (error) {
      console.error('Error saving caller IDs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">CallerID Block</h1>
            <p className="text-sm text-gray-600">
              Gerencie os números que serão bloqueados
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Adicionar Novo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Data</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">CallerID</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {callerIDs.map((block) => (
              <tr key={block.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {format(new Date(block.created_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{block.callerid}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(block.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Ban className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Adicionar CallerID Block</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Números
              </label>
              <textarea
                value={newCallerIDs}
                onChange={(e) => setNewCallerIDs(e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                rows={4}
                placeholder="Digite os números separados por vírgula..."
              />
              <p className="mt-2 text-sm text-gray-500">Use vírgula (,) para separar os números</p>
              
              {newCallerIDs && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {newCallerIDs.split(',').map((number, index) => (
                    number.trim() && (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700"
                      >
                        {number.trim()}
                      </span>
                    )
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !newCallerIDs.trim()}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
