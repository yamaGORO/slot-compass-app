'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CalculationResult } from '@/types';
import { generateChartData } from '@/lib/calculator';
import { ChevronDown } from 'lucide-react';

interface EVChartProps {
  result: CalculationResult | null;
}

const HOUR_OPTIONS = [3, 5, 8] as const;

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const isPositive = value >= 0;
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: '#1a1a1a',
        border: '1px solid rgba(201,150,42,0.3)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
      }}
    >
      <p className="text-white/50 mb-0.5">{label}</p>
      <p
        className="font-bold"
        style={{ color: isPositive ? '#c9962a' : '#e05252' }}
      >
        {isPositive ? '+' : ''}
        {value.toLocaleString('ja-JP')}円
      </p>
    </div>
  );
}

export default function ExpectedValueChart({ result }: EVChartProps) {
  const [selectedHours, setSelectedHours] = useState<number>(5);

  const data = useMemo(() => {
    if (!result) {
      // Demo data
      return Array.from({ length: 21 }, (_, i) => ({
        time: `${(i * 0.25).toFixed(2)}h`,
        value: 0,
      }));
    }
    return generateChartData(result, selectedHours);
  }, [result, selectedHours]);

  const lastValue = data[data.length - 1]?.value ?? 0;
  const isPositive = lastValue >= 0;

  return (
    <section className="px-4 py-3">
      <div
        className="rounded-2xl overflow-hidden p-4"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9962a" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span className="text-sm font-semibold text-white">期待値の推移</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Hour selector */}
            <div className="relative">
              <select
                value={selectedHours}
                onChange={(e) => setSelectedHours(Number(e.target.value))}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-[11px] font-medium text-white/80 cursor-pointer"
                style={{
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}時間後
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-40 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="evGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? '#c9962a' : '#e05252'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? '#c9962a' : '#e05252'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(data.length / 5)}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v > 0 ? '+' : ''}${(v / 1000).toFixed(0)}k`}
                width={34}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Zero line */}
              <CartesianGrid
                strokeDasharray="0"
                stroke="rgba(255,255,255,0.15)"
                horizontal={false}
                verticalPoints={[]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#c9962a' : '#e05252'}
                strokeWidth={2}
                fill="url(#evGradient)"
                dot={false}
                activeDot={{ r: 4, fill: isPositive ? '#c9962a' : '#e05252', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* End value badge */}
        {result && (
          <div className="flex justify-end mt-1">
            <div
              className="px-2.5 py-1 rounded-md text-[11px] font-bold"
              style={{
                background: isPositive ? 'rgba(201,150,42,0.2)' : 'rgba(224,82,82,0.2)',
                color: isPositive ? '#c9962a' : '#e05252',
                border: `1px solid ${isPositive ? 'rgba(201,150,42,0.4)' : 'rgba(224,82,82,0.4)'}`,
              }}
            >
              {isPositive ? '+' : ''}
              {lastValue.toLocaleString('ja-JP')}円
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
