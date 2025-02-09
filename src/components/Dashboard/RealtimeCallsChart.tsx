import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { Phone, TrendingUp } from 'lucide-react';
import { useActiveCalls } from '../../hooks/useActiveCalls';

interface CallData {
  time: string;
  falando: number;
  chamando: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-800">
        <p className="text-gray-400 text-sm mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-cyan-400 font-medium flex items-center justify-between">
            <span>Falando:</span>
            <span className="ml-3">{payload[0].value}</span>
          </p>
          <p className="text-yellow-400 font-medium flex items-center justify-between">
            <span>Chamando:</span>
            <span className="ml-3">{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = () => {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
        <span className="text-gray-600">Falando</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <span className="text-gray-600">Chamando</span>
      </div>
    </div>
  );
};

export const RealtimeCallsChart = () => {
  const [data, setData] = useState<CallData[]>([]);
  const { data: activeCalls = [], isLoading } = useActiveCalls();
  const [maxValue, setMaxValue] = useState(0);

  // Atualiza o gráfico quando as chamadas mudarem
  useEffect(() => {
    const now = new Date();
    const falando = activeCalls.filter(call => call.status === "Falando").length;
    const chamando = activeCalls.filter(call => call.status === "Chamando").length;

    const total = falando + chamando;
    setMaxValue(prev => Math.max(prev, total));

    setData(prev => {
      const newData = [
        ...prev,
        {
          time: format(now, 'HH:mm:ss'),
          falando,
          chamando,
        },
      ];

      // Mantém os últimos 30 pontos
      if (newData.length > 30) {
        return newData.slice(-30);
      }
      return newData;
    });
  }, [activeCalls]);

  if (isLoading && data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <TrendingUp className="w-5 h-5" />
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  const currentFalando = data[data.length - 1]?.falando || 0;
  const currentChamando = data[data.length - 1]?.chamando || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Chamadas em Tempo Real</h2>
          <p className="text-sm text-gray-500">Atualização a cada 5 segundos</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <Phone className="w-5 h-5 text-cyan-500" />
            <span>{currentFalando + currentChamando}</span>
          </div>
          <span className="text-sm text-gray-500">Total atual</span>
        </div>
      </div>
      
      <CustomLegend />
      
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
            stackOffset="none"
          >
            <defs>
              <linearGradient id="colorFalando" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorChamando" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
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
              domain={[0, (dataMax: number) => Math.max(5, maxValue + 1)]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="falando"
              stackId="1"
              stroke="#06B6D4"
              strokeWidth={2}
              fill="url(#colorFalando)"
              dot={false}
              activeDot={{
                r: 6,
                stroke: '#06B6D4',
                strokeWidth: 2,
                fill: '#fff'
              }}
            />
            <Area
              type="monotone"
              dataKey="chamando"
              stackId="1"
              stroke="#EAB308"
              strokeWidth={2}
              fill="url(#colorChamando)"
              dot={false}
              activeDot={{
                r: 6,
                stroke: '#EAB308',
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
