import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface FinanceStats {
  totalRevenue: number;
  averageRevenue: number;
  todayRevenue: number;
}

interface Payment {
  id: string;
  plano: string;
  valor: number;
  status: string;
  nomepagador: string;
  username: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 15;

export const Finance = () => {
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    averageRevenue: 0,
    todayRevenue: 0
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFinanceData();
  }, [currentPage]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar total de registros para paginação
      const { count } = await supabase
        .from('pagamentos')
        .select('*', { count: 'exact', head: true });

      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      // Buscar dados da tabela pagamentos com paginação
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('pagamentos')
        .select(`
          id,
          plano,
          valor,
          status,
          nomepagador,
          username,
          created_at
        `)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (paymentsError) throw paymentsError;

      // Buscar dados para estatísticas (sem paginação)
      const { data: allPayments } = await supabase
        .from('pagamentos')
        .select('valor, created_at');

      // Calcular estatísticas
      const totalRevenue = allPayments?.reduce((sum, payment) => sum + payment.valor, 0) || 0;
      const averageRevenue = allPayments?.length ? totalRevenue / allPayments.length : 0;

      // Calcular receita de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRevenue = allPayments?.reduce((sum, payment) => {
        const paymentDate = new Date(payment.created_at);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() === today.getTime() ? sum + payment.valor : sum;
      }, 0) || 0;

      setStats({
        totalRevenue,
        averageRevenue,
        todayRevenue
      });
      setPayments(paymentsData || []);

    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      setError('Erro ao carregar dados financeiros');
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
        <button
          onClick={() => fetchFinanceData()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Receita Total */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden rounded-xl shadow-sm border border-green-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-500 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 uppercase tracking-wider">Receita Total</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Receita Média */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 overflow-hidden rounded-xl shadow-sm border border-violet-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-violet-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 uppercase tracking-wider">Receita Média</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.averageRevenue)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Receita Hoje */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden rounded-xl shadow-sm border border-blue-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <CalendarClock className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 uppercase tracking-wider">Receita Hoje</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.todayRevenue)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Pagamentos */}
      <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagador
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhum pagamento encontrado
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.plano}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(payment.valor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {payment.status === 'completed' ? 'Concluído' : 
                         payment.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.nomepagador}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> até{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, (totalPages * ITEMS_PER_PAGE))}
                </span> de{' '}
                <span className="font-medium">{totalPages * ITEMS_PER_PAGE}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === idx + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Próxima</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
