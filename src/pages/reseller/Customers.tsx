import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { CustomersTable } from '../../components/Reseller/Customers/CustomersTable';
import { CustomerForm } from '../../components/Reseller/Customers/CustomerForm';
import { useAuth } from '../../contexts/AuthContext';

interface Customer {
  id: string;
  name: string;
  document: string;
  email: string;
  contact: string;
  resellerid: string;
  accountid: string;
}

export const ResellerCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usersreseller')
        .select('id, name, document, email, contact, resellerid, accountid')
        .eq('resellerid', user?.id)
        .order('name');

      if (error) throw error;

      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user?.id]);

  const handleCreateCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('usersreseller')
        .insert([customerData])
        .select('id, name, document, email, contact, resellerid, accountid')
        .single();

      if (error) throw error;

      setCustomers(prev => [...prev, data]);
      setShowForm(false);
      toast.success('Cliente criado com sucesso');
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Erro ao criar cliente');
      throw error;
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('usersreseller')
        .delete()
        .eq('id', customer.id);

      if (error) throw error;

      setCustomers(prev => prev.filter(c => c.id !== customer.id));
      toast.success('Cliente excluído com sucesso');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleBulkDelete = async (customerIds: string[]) => {
    try {
      const { error } = await supabase
        .from('usersreseller')
        .delete()
        .in('id', customerIds);

      if (error) throw error;

      setCustomers(prev => prev.filter(c => !customerIds.includes(c.id)));
      toast.success('Clientes excluídos com sucesso');
    } catch (error) {
      console.error('Error deleting customers:', error);
      toast.error('Erro ao excluir clientes');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie seus clientes</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchCustomers();
            }}
            className="p-2 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      <CustomersTable
        customers={customers}
        onDelete={handleDeleteCustomer}
        onBulkDelete={handleBulkDelete}
      />

      {showForm && (
        <CustomerForm
          onSubmit={handleCreateCustomer}
          onClose={() => setShowForm(false)}
          resellerId={user?.id || ''}
        />
      )}
    </div>
  );
};
