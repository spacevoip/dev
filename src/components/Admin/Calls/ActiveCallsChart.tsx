import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import '../../../lib/chartjs';

interface ActiveCall {
  Accountcode: string;
  Application: string;
  BridgeID: string;
  CallerID: string;
  Channel: string;
  Context: string;
  Data: string;
  Duration: string;
  Extension: string;
  PeerAccount: string;
  Prio: string;
  State: string;
}

async function fetchActiveCalls() {
  try {
    const response = await fetch('https://intermed.appinovavoip.com:3000/active-calls?adminpass=35981517Biu', {
      headers: {
        'x-api-key': '191e8a1e-d313-4e12-b608-d1a759b1a106'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar chamadas ativas');
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Dados recebidos não são um array:', data);
      return {
        activeCalls: [],
        totalCalls: 0,
        callingCalls: 0,
        talkingCalls: 0,
      };
    }

    // Filtrar apenas chamadas com Application = "Dial"
    const activeCalls = data.filter(call => call && call.Application === "Dial");
    
    return {
      activeCalls,
      totalCalls: activeCalls.length,
      callingCalls: activeCalls.filter(call => call.State === "Ring").length,
      talkingCalls: activeCalls.filter(call => call.State === "Up").length,
    };
  } catch (error) {
    console.error('Erro ao buscar chamadas ativas:', error);
    return {
      activeCalls: [],
      totalCalls: 0,
      callingCalls: 0,
      talkingCalls: 0,
    };
  }
}

export function ActiveCallsChart() {
  const { data: callsData, isLoading, error } = useQuery({
    queryKey: ['activeCalls'],
    queryFn: fetchActiveCalls,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chamadas Ativas</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chamadas Ativas</h3>
        <div className="flex items-center justify-center h-[300px] text-red-500">
          Erro ao carregar dados das chamadas
        </div>
      </div>
    );
  }

  const data = {
    labels: ['Em Conversação', 'Chamando'],
    datasets: [
      {
        data: [callsData?.talkingCalls || 0, callsData?.callingCalls || 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // Verde para conversação
          'rgba(251, 191, 36, 0.8)'  // Amarelo para chamando
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)'
        ],
        borderWidth: 2,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (item: any) => {
            const value = parseInt(item.formattedValue);
            if (value === 1) {
              return `${value} chamada ${item.label.toLowerCase()}`;
            }
            return `${value} chamadas ${item.label.toLowerCase()}`;
          }
        }
      }
    }
  };

  const totalCalls = (callsData?.totalCalls || 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chamadas Ativas</h3>
      <div className="relative" style={{ height: '300px' }}>
        <Doughnut data={data} options={options} />
        {/* Contador central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">
            {totalCalls}
          </span>
          <span className="text-sm text-gray-500">Total de Chamadas</span>
        </div>
      </div>
    </div>
  );
}
