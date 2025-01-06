import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { Phone } from 'lucide-react';
import { useActiveCalls } from '../../hooks/useActiveCalls';

interface CallData {
  time: string;
  chamadas: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-800">
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-white font-medium">
          {payload[0].value} chamada{payload[0].value !== 1 ? 's' : ''} em curso
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = () => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Phone className="w-4 h-4" />
      <span>Chamadas em Curso</span>
    </div>
  );
};

export const RealtimeCallsChart = () => {
  const [data, setData] = useState<CallData[]>([]);
  const { data: activeCalls = [], isLoading } = useActiveCalls();

  // Atualiza o gráfico quando as chamadas mudarem
  useEffect(() => {
    const now = new Date();
    // Conta apenas chamadas com status "Falando"
    const chamadas = activeCalls.filter(call => call.status === "Falando").length;

    setData(prev => {
      const newData = [
        ...prev,
        {
          time: format(now, 'HH:mm:ss'),
          chamadas,
        },
      ];

      if (newData.length > 30) {
        return newData.slice(-30);
      }
      return newData;
    });
  }, [activeCalls]);

  if (isLoading && data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Chamadas em Curso</h2>
        <CustomLegend />
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorChamadas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dx={-10}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.max(5, dataMax + 1)]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="chamadas"
              stroke="#06B6D4"
              strokeWidth={2}
              fill="url(#colorChamadas)"
              dot={false}
              activeDot={{
                r: 6,
                stroke: '#06B6D4',
                strokeWidth: 2,
                fill: '#fff'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
