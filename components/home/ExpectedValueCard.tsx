'use client';

import Link from 'next/link';
import { ChevronRight, Info } from 'lucide-react';
import type { CalculationResult } from '@/types';

interface ExpectedValueCardProps {
  result: CalculationResult | null;
}

function formatEV(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
}

export default function ExpectedValueCard({ result }: ExpectedValueCardProps) {
  const hasResult = result !== null;
  const ev = result?.expectedValue ?? 0;
  const isPositive = ev >= 0;
  const fallbackHours = Math.max(0.1, Number.parseFloat(result?.inputs.remainingHours || '') || 3);
  const expectedValuePerHour = result?.expectedValuePerHour ?? ev / fallbackHours;

  return (
    <section className="px-4 pt-3 pb-2">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #131313 0%, #0d0d0d 100%)',
          border: `1px solid ${hasResult ? 'rgba(201,150,42,0.3)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: hasResult ? '0 6px 28px rgba(0,0,0,0.7)' : '0 4px 16px rgba(0,0,0,0.5)',
        }}
      >
        {/* Card header row */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/40 tracking-tight">現在の期待値（円）</span>
            <button type="button" aria-label="期待値の説明" className="opacity-30 hover:opacity-60 transition-opacity">
              <Info size={11} color="#ffffff" />
            </button>
          </div>
          {hasResult && (
            <Link
              href="/result"
              className="flex items-center gap-0.5 text-[10px] font-medium text-[#c9962a] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(201,150,42,0.1)', border: '1px solid rgba(201,150,42,0.25)' }}
            >
              詳細データ
              <ChevronRight size={9} />
            </Link>
          )}
        </div>

        {/* EV number + side stats */}
        <div className="flex items-start justify-between px-5 pb-3 pt-1">
          {/* Left: big EV number */}
          <div className="flex flex-col gap-2 flex-1">
            <div
              className="font-bold leading-none tracking-tight"
              style={{ fontFeatureSettings: '"tnum"' }}
            >
              {hasResult ? (
                <span
                  style={{
                    fontSize: '3rem',
                    color: isPositive ? '#c9962a' : '#e05252',
                  }}
                >
                  {formatEV(ev)}
                  <span style={{ fontSize: '1.5rem', marginLeft: '4px', fontWeight: 600 }}>円</span>
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '2.5rem',
                    color: 'rgba(201,150,42,0.2)',
                    letterSpacing: '0.05em',
                  }}
                >
                  ———<span style={{ fontSize: '1.25rem', marginLeft: '2px' }}>円</span>
                </span>
              )}
            </div>

            {/* Badge row */}
            {hasResult && result!.highSettingProbability > 0.25 && (
              <div
                className="inline-flex items-center self-start px-2.5 py-1 rounded-md"
                style={{
                  background: 'rgba(201,150,42,0.18)',
                  border: '1px solid rgba(201,150,42,0.35)',
                }}
              >
                <span className="text-[10px] font-bold text-[#c9962a]">
                  高設定期待度：{Math.round(result!.highSettingProbability * 100)}%
                </span>
              </div>
            )}
            {!hasResult && (
              <p className="text-[11px] text-white/25 mt-0.5">計算画面からデータを入力してください</p>
            )}
          </div>

          {/* Right: setting + payback */}
          {hasResult && (
            <div className="flex flex-col items-end gap-1 pl-4">
              <div className="flex items-stretch gap-3">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-white/40 whitespace-nowrap">予想設定</span>
                  <span
                    className="text-[2rem] font-bold leading-none"
                    style={{ color: '#c9962a', fontFeatureSettings: '"tnum"' }}
                  >
                    {result!.estimatedSetting.toFixed(1)}
                  </span>
                </div>
                <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-white/40 whitespace-nowrap">機械割</span>
                  <span
                    className="text-[2rem] font-bold leading-none text-white"
                    style={{ fontFeatureSettings: '"tnum"' }}
                  >
                    {result!.estimatedPayback.toFixed(1)}
                    <span className="text-sm font-medium">%</span>
                  </span>
                </div>
              </div>
              <span className="text-[9px] text-white/25">
                {formatEV(expectedValuePerHour)}円 / 1時間あたり
              </span>
            </div>
          )}
        </div>

        {/* Machine name footer strip */}
        {hasResult && (
          <div
            className="px-5 py-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-[10px] text-white/35">{result!.machineName}</span>
          </div>
        )}
      </div>
    </section>
  );
}
