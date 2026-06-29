'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { MACHINES, getMachineById } from '@/data/machines';
import { calculateExpectedValue } from '@/lib/calculator';
import { getSettings, saveCurrentResult, addToHistory, setRecentMachineId } from '@/lib/store';
import type { CommonInputs, ExtraInputs } from '@/types';

// ─── Input field component ────────────────────────────────────────────────────
interface FieldProps {
  icon?: React.ReactNode;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: 'numeric' | 'decimal';
  description?: string;
  fullWidth?: boolean;
}

function InputField({ icon, label, unit, value, onChange, inputMode = 'numeric', description }: FieldProps) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-xl"
      style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)' }}
    >
      <div className="flex items-start gap-1.5 min-w-0 flex-1">
        {icon && <span className="flex-shrink-0 text-[#c9962a] mt-0.5">{icon}</span>}
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-[#444444] leading-tight break-keep">{label}</p>
          {description && <p className="text-[9px] text-[#aaaaaa] leading-tight mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 ml-1.5">
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="w-14 text-right text-sm font-bold text-[#111111] bg-transparent outline-none"
          style={{ fontFeatureSettings: '"tnum"' }}
          aria-label={label}
        />
        <span className="text-[10px] text-[#999999] w-4 text-left">{unit}</span>
      </div>
    </div>
  );
}

// ─── Time input ───────────────────────────────────────────────────────────────
interface TimeFieldProps {
  hours: string;
  minutes: string;
  onHoursChange: (v: string) => void;
  onMinutesChange: (v: string) => void;
}

function TimeField({ hours, minutes, onHoursChange, onMinutesChange }: TimeFieldProps) {
  return (
    <div
      className="flex items-center justify-between px-3.5 py-3 rounded-xl"
      style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[#c9962a] flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </span>
        <p className="text-[11px] font-medium text-[#444444]">残り時間（任意）</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input
          type="text"
          inputMode="numeric"
          value={hours}
          onChange={(e) => onHoursChange(e.target.value)}
          placeholder=""
          className="w-9 text-right text-sm font-bold text-[#111111] bg-transparent outline-none"
          style={{ fontFeatureSettings: '"tnum"' }}
          aria-label="残り時間（時間）"
        />
        <span className="text-[11px] text-[#999999]">時間</span>
        <input
          type="text"
          inputMode="numeric"
          value={minutes}
          onChange={(e) => onMinutesChange(e.target.value)}
          placeholder=""
          className="w-8 text-right text-sm font-bold text-[#111111] bg-transparent outline-none"
          style={{ fontFeatureSettings: '"tnum"' }}
          aria-label="残り時間（分）"
        />
        <span className="text-[11px] text-[#999999]">分</span>
      </div>
    </div>
  );
}

// ─── Page content ─────────────────────────────────────────────────────────────
function CalculationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMachineId = searchParams.get('machine') ?? '';

  const [selectedMachineId, setSelectedMachineId] = useState(initialMachineId);
  const [inputs, setInputs] = useState<CommonInputs>({
    totalGames: '',
    currentGames: '',
    bbCount: '',
    rbCount: '',
    remainingHours: '',
    remainingMinutes: '',
  });
  const [extraInputs, setExtraInputs] = useState<ExtraInputs>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const machine = getMachineById(selectedMachineId);

  useEffect(() => {
    const s = getSettings();
    setInputs((prev) => ({
      ...prev,
      remainingHours: s.defaultRemainingHours > 0 ? String(s.defaultRemainingHours) : '',
      remainingMinutes: '',
    }));
  }, []);

  const setCommon = (key: keyof CommonInputs) => (val: string) =>
    setInputs((p) => ({ ...p, [key]: val }));

  const setExtra = (key: string) => (val: string) =>
    setExtraInputs((p) => ({ ...p, [key]: val }));

  const handleReset = () => {
    setInputs({ totalGames: '', currentGames: '', bbCount: '', rbCount: '', remainingHours: '', remainingMinutes: '' });
    setExtraInputs({});
  };

  const handleCalculate = () => {
    if (!machine) return;
    setIsCalculating(true);
    const settings = getSettings();
    const result = calculateExpectedValue(machine, inputs, extraInputs, settings);
    saveCurrentResult(result);
    addToHistory(result);
    setRecentMachineId(machine.id);
    setTimeout(() => {
      setIsCalculating(false);
      router.push('/result');
    }, 300);
  };

  // Completeness check
  const hasMinimumData = Boolean(
    selectedMachineId &&
    inputs.totalGames &&
    Number(inputs.totalGames) > 0,
  );

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
        style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h1 className="text-base font-bold text-white">データを入力</h1>
        {machine && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <RotateCcw size={13} />
            リセット
          </button>
        )}
      </div>

      <div className="px-4 pb-8 space-y-4">

        {/* Main input card */}
        <div
          className="rounded-2xl overflow-hidden mt-3"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Card header with icon + machine selector */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9962a" strokeWidth="1.5">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
              </svg>
              <span className="text-xs font-semibold text-white/70">データを入力</span>
            </div>
            {/* Machine selector — compact */}
            <div className="relative flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9962a" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              <select
                value={selectedMachineId}
                onChange={(e) => {
                  setSelectedMachineId(e.target.value);
                  setExtraInputs({});
                }}
                className="appearance-none h-8 pl-1 pr-6 rounded-lg text-xs font-semibold cursor-pointer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: selectedMachineId ? '#c9962a' : '#888888',
                  maxWidth: '130px',
                }}
                aria-label="機種を選択"
              >
                <option value="" disabled>機種を選択</option>
                {MACHINES.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: '#1a1a1a' }}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={11}
                className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
                color="#c9962a"
              />
            </div>
          </div>

          {/* Input form — only shown after machine selection */}
          {machine ? (
            <div className="p-3 space-y-2">
              {/* Common fields grid */}
              <div className="grid grid-cols-2 gap-2">
                <InputField
                  label="総回転数"
                  unit="G"
                  value={inputs.totalGames}
                  onChange={setCommon('totalGames')}
                  icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                    </svg>
                  }
                />
                <InputField
                  label="現在の回転数"
                  unit="G"
                  value={inputs.currentGames}
                  onChange={setCommon('currentGames')}
                  icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                    </svg>
                  }
                />
                <InputField
                  label="BB回数"
                  unit="回"
                  value={inputs.bbCount}
                  onChange={setCommon('bbCount')}
                  icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="2"/><path d="M8 12h8M12 8v8"/>
                    </svg>
                  }
                />
                <InputField
                  label="RB回数"
                  unit="回"
                  value={inputs.rbCount}
                  onChange={setCommon('rbCount')}
                  icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="2"/><path d="M8 12h8"/>
                    </svg>
                  }
                />
              </div>

              {/* Bonus ratio — full width display row */}
              {inputs.totalGames && (Number(inputs.bbCount) + Number(inputs.rbCount)) > 0 && (
                <div
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
                  style={{ background: 'rgba(201,150,42,0.07)', border: '1px solid rgba(201,150,42,0.15)' }}
                >
                  <div className="flex items-center gap-2 text-xs text-[#c9962a]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    <span className="text-[11px]">ボーナス合算</span>
                  </div>
                  <span className="text-sm font-bold text-[#c9962a]" style={{ fontFeatureSettings: '"tnum"' }}>
                    1/{(Number(inputs.totalGames) / (Number(inputs.bbCount) + Number(inputs.rbCount))).toFixed(1)}
                  </span>
                </div>
              )}

              {/* Remaining time — full width */}
              <TimeField
                hours={inputs.remainingHours}
                minutes={inputs.remainingMinutes}
                onHoursChange={setCommon('remainingHours')}
                onMinutesChange={setCommon('remainingMinutes')}
              />
            </div>
          ) : (
            /* Empty state when no machine selected */
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(201,150,42,0.08)', border: '1px solid rgba(201,150,42,0.15)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9962a" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div className="text-center px-4">
                <p className="text-xs font-semibold text-white/50">機種を選択してください</p>
                <p className="text-[10px] text-white/25 mt-1">右上のプルダウンから機種を選ぶと<br />入力フォームが表示されます</p>
              </div>
            </div>
          )}
        </div>

        {/* Machine-specific fields card */}
        {machine && machine.extraFields.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-1 h-4 rounded-full" style={{ background: '#888888' }} />
              <span className="text-xs font-semibold text-white/50 tracking-wide">
                {machine.name} 専用データ
              </span>
            </div>
            <div className="p-3 space-y-2">
              {machine.extraFields.map((field) => (
                <InputField
                  key={field.key}
                  label={field.label}
                  unit={field.unit}
                  value={extraInputs[field.key] ?? ''}
                  onChange={setExtra(field.key)}
                  description={field.description}
                  inputMode="numeric"
                />
              ))}
            </div>
          </div>
        )}

        {/* Calculate button */}
        {machine && (
          <button
            type="button"
            onClick={handleCalculate}
            disabled={!hasMinimumData || isCalculating}
            className="w-full h-14 rounded-2xl flex items-center justify-between px-6 font-bold text-base transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: hasMinimumData
                ? 'linear-gradient(90deg, #b8860b 0%, #d4a017 45%, #c9962a 100%)'
                : '#1e1e1e',
              color: hasMinimumData ? '#080808' : '#444',
              boxShadow: hasMinimumData ? '0 4px 24px rgba(201,150,42,0.4)' : 'none',
              border: hasMinimumData ? 'none' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={hasMinimumData ? 2.5 : 1.5}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span>{isCalculating ? '計算中...' : '期待値を計算する'}</span>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: hasMinimumData ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.05)' }}
            >
              <ChevronRight size={16} />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default function CalculationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
      <CalculationContent />
    </Suspense>
  );
}
