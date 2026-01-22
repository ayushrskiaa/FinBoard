'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { getValueByPath } from '@/lib/api-helper';

interface SimpleChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  selectedFields: string[];
}

export function SimpleChart({ data, selectedFields }: SimpleChartProps) {
  if (!data || selectedFields.length === 0) return null;

  const firstField = selectedFields[0];
  const arrayPath = firstField.substring(0, firstField.lastIndexOf('[]') + 2);

  if (!arrayPath || arrayPath === firstField) {
      return <div className="p-4 text-muted-foreground">Select fields inside an array for the chart.</div>;
  }

  const rows = getValueByPath(data, arrayPath);

  if (!Array.isArray(rows)) {
    return <div className="p-4 text-muted-foreground">No array data found at {arrayPath}</div>;
  }

  // Determine X and Y
  // If > 1 field, field[0] is X, field[1] is Y
  // If 1 field, field[0] is Y, X is index
  
  let xKey = 'index';
  let yKey = 'value';
  let dataKeyX = '';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let dataKeyY = '';

  if (selectedFields.length >= 2) {
    dataKeyX = selectedFields[0].replace(arrayPath + '.', '');
    dataKeyY = selectedFields[1].replace(arrayPath + '.', '');
    xKey = dataKeyX;
    yKey = dataKeyY;
  } else {
    dataKeyY = selectedFields[0].replace(arrayPath + '.', '');
    yKey = dataKeyY;
  }

  // Transform data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData = rows.map((row: any, i: number) => {
    const xVal = dataKeyX ? getValueByPath(row, dataKeyX) : i;
    const yVal = getValueByPath(row, yKey);
    return {
      [xKey]: xVal,
      [yKey]: Number(yVal) // Ensure number
    };
  });

  return (
    <div className="w-full h-full min-h-[150px] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => String(val).substring(0, 10)} 
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area 
            type="monotone" 
            dataKey={yKey} 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
