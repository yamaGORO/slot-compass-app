'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { getCurrentResult } from '@/lib/store';
import type { CalculationResult } from '@/types';

function formatEV(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
}

// Setting distribution bar
function SettingBar({ label, probability }: { label: string; probability: number }) {
  const pct = Math.round(probability * 100);
  const isHigh = Number(label) >= 5;
  const isMid = Number(label) === 4;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold w-6 text-right" style={{ color: isHigh ? '#c9962a' : isMid ? '#e8c64a' : '#888888' }}>
        設{label}
      </span>
      <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: isHigh
              ? 'linear-gradient(90deg, #b8860b, #e8c64a)'
              : isMid
              ? '#666633'
              : '#333333',
          }}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color: isHigh ? '#c9962a' : '#666666' }}>
        {pct}%
      </span>
    </div>
  );
}

// Stat card
function StatCard({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 rounded-xl gap-1"
      style={{
        background: highlight ? 'rgba(201,150,42,0.08)' : '#1a1a1a',
        border: highlight ? '1px solid rgba(201,150,42,0.25)' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span className="text-[10px] text-white/40 text-center leading-tight">{label}</span>
      <span
        className="text-xl font-bold leading-tight"
        style={{ color: highlight ? '#c9962a' : '#ffffff', fontFeatureSettings: '"tnum"' }}
      >
        {value}
        {unit && <span className="text-sm ml-0.5 font-medium">{unit}</span>}
      </span>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const r = getCurrentResult();
    if (!r) {
      router.replace('/calculation');
      return;
    }
    setResult(r);
  }, [router]);

  if (!result) {
    return <div className="min-h-screen bg-[#080808]" />;
  }

  const isPositive = result.expectedValue >= 0;
  const dist = result.settingDistribution;
  const isAType = !result.stateExpectedValues;
  const expectedValuePerHour =
    result.expectedValuePerHour ??
    result.expectedValue / Math.max(0.1, Number.parseFloat(result.inputs.remainingHours || '') || 3);

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
        style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          type="button"
          onClick={() => router.push('/calculation')}
          className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          aria-label="計算画面に戻る"
        >
          <ChevronLeft size={18} />
          戻る
        </button>
        <h1 className="text-sm font-bold text-white">解析結果</h1>
        <button
          type="button"
          onClick={() => router.push('/calculation')}
          className="flex items-center gap-1.5 text-xs text-[#c9962a] hover:text-[#e8c64a] transition-colors"
        >
          <RefreshCw size={13} />
          再計算
        </button>
      </div>

      <div className="px-4 pb-8 space-y-3">

        {/* Machine name */}
        <div className="pt-4">
          <p className="text-xs text-white/40">{result.machineName}</p>
        </div>

        {/* MAIN EV CARD */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(150deg, #131313 0%, #0d0d0d 100%)',
            border: `1px solid ${isPositive ? 'rgba(201,150,42,0.35)' : 'rgba(224,82,82,0.35)'}`,
            boxShadow: isPositive ? '0 8px 32px rgba(201,150,42,0.12)' : '0 8px 32px rgba(224,82,82,0.12)',
          }}
        >
          <div className="px-6 pt-5 pb-4">
            <p className="text-[11px] text-white/40 mb-3">期待値（円）</p>
            <div className="flex items-end justify-between">
              {/* Big EV number */}
              <div>
                <div
                  className="font-bold leading-none tracking-tight"
                  style={{
                    fontSize: '3.5rem',
                    color: isPositive ? '#c9962a' : '#e05252',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {formatEV(result.expectedValue)}
                </div>
                <div
                  className="text-2xl font-semibold mt-0.5"
                  style={{ color: isPositive ? 'rgba(201,150,42,0.7)' : 'rgba(224,82,82,0.7)' }}
                >
                  円
                </div>
              </div>

              {/* Side stats */}
              <div className="flex items-stretch gap-4 pb-1">
                <div className="text-right">
                  <p className="text-[9px] text-white/40 mb-0.5">予想設定</p>
                  <p className="text-3xl font-bold" style={{ color: '#c9962a', fontFeatureSettings: '"tnum"' }}>
                    {result.estimatedSetting.toFixed(1)}
                  </p>
                </div>
                <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <div className="text-right">
                  <p className="text-[9px] text-white/40 mb-0.5">機械割</p>
                  <p className="text-3xl font-bold text-white" style={{ fontFeatureSettings: '"tnum"' }}>
                    {result.estimatedPayback.toFixed(1)}<span className="text-base font-medium">%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <div
            className="px-6 py-2.5 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}
          >
            <span className="text-[10px] text-white/30">{result.machineName}</span>
            <span className="text-[10px] text-white/25">
              {formatEV(expectedValuePerHour)}円/h
            </span>
          </div>
        </div>

        {/* Setting probability breakdown */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-semibold text-white mb-4">予想設定分布</h2>
          <div className="space-y-3">
            {[
              { label: '1', prob: dist.s1 },
              { label: '2', prob: dist.s2 },
              { label: '3', prob: dist.s3 },
              { label: '4', prob: dist.s4 },
              { label: '5', prob: dist.s5 },
              { label: '6', prob: dist.s6 },
            ].map(({ label, prob }) => (
              <SettingBar key={label} label={label} probability={prob} />
            ))}
          </div>
        </div>

        {/* Probability stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="設定4以上の期待度"
            value={`${Math.round(result.highSettingProbability * 100)}`}
            unit="%"
            highlight={result.highSettingProbability > 0.3}
          />
          <StatCard
            label="設定5以上の期待度"
            value={`${Math.round(result.veryHighSettingProbability * 100)}`}
            unit="%"
            highlight={result.veryHighSettingProbability > 0.2}
          />
        </div>

        {/* Non-A-type extras */}
        {!isAType && result.remainingToCeiling !== undefined && (
          <>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-1 h-4 rounded-full" style={{ background: '#888888' }} />
              <span className="text-xs font-semibold text-white/50 tracking-wide">機種別参考データ</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                label="天井まで残り"
                value={`${result.remainingToCeiling}`}
                unit="G"
                highlight={(result.remainingToCeiling ?? 9999) < 300}
              />
              {result.stateExpectedValues?.map((sv) => (
                <StatCard
                  key={sv.label}
                  label={sv.label}
                  value={`${sv.value >= 0 ? '+' : ''}${sv.value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`}
                  unit="円"
                  highlight={sv.value > 0}
                />
              ))}
            </div>
          </>
        )}

        {/* Data quality note (if inputs are sparse) */}
        {!result.inputs.bbCount && !result.inputs.rbCount && (
          <div
            className="rounded-xl p-4 flex gap-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-xs text-white/40 leading-relaxed">
              BB・RB回数を入力すると、設定推測の精度が大幅に向上します。現在は総回転数のみから算出しています。
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 h-12 rounded-xl text-sm font-semibold text-white/60 transition-all active:scale-95"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            ホームに戻る
          </button>
          <button
            type="button"
            onClick={() => router.push('/calculation')}
            className="flex-1 h-12 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: 'linear-gradient(90deg, #b8860b, #c9962a)',
              color: '#080808',
            }}
          >
            再計算する
          </button>
        </div>
      </div>
    </div>
  );
}
