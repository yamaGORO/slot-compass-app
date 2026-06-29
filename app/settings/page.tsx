'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/lib/store';
import type { AppSettings } from '@/types';
import { Check } from 'lucide-react';
import CompassLogo from '@/components/ui/CompassLogo';

// ─── Reusable setting row components ─────────────────────────────────────────

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80 leading-tight">{label}</p>
        {description && <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function NumberInput({ value, onChange, min, max, step = 1 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      inputMode="decimal"
      className="w-24 text-right px-3 py-2 rounded-lg text-sm font-bold text-white outline-none"
      style={{
        background: '#1e1e1e',
        border: '1px solid rgba(255,255,255,0.1)',
        fontFeatureSettings: '"tnum"',
      }}
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-12 h-6 rounded-full flex items-center transition-all"
      style={{
        background: checked ? 'linear-gradient(90deg, #b8860b, #c9962a)' : '#2a2a2a',
        paddingLeft: checked ? '26px' : '2px',
        border: checked ? '1px solid rgba(201,150,42,0.5)' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="w-5 h-5 rounded-full bg-white shadow-md transition-all" />
    </button>
  );
}

function SelectInput<T extends string>({ value, onChange, options }: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none px-3 py-2 pr-7 rounded-lg text-sm font-semibold text-white outline-none cursor-pointer"
        style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  };

  const handleSave = () => {
    if (!settings) return;
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return <div className="min-h-screen bg-[#080808]" />;

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 py-4"
        style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h1 className="text-base font-bold text-white">設定・情報</h1>
      </div>

      <div className="pb-8">
        {/* ── ホール設定 ── */}
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-xs font-semibold text-[#c9962a] tracking-widest uppercase">ホール設定</h2>
        </div>
        <div style={{ background: '#111111', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <SettingRow label="貸しメダル" description="1枚あたりの金額（円）">
            <NumberInput value={settings.medalRate} onChange={(v) => update('medalRate', v)} min={1} max={50} />
          </SettingRow>
          <SettingRow label="交換率" description="メダル何枚で1円に交換できるか">
            <NumberInput value={settings.exchangeRate} onChange={(v) => update('exchangeRate', v)} min={1} max={10} step={0.1} />
          </SettingRow>
          <SettingRow label="持ちメダル優先" description="持ちメダルがある場合に優先使用">
            <Toggle checked={settings.useCashMedals} onChange={(v) => update('useCashMedals', v)} />
          </SettingRow>
        </div>

        {/* ── 計算設定 ── */}
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-xs font-semibold text-[#c9962a] tracking-widest uppercase">計算設定</h2>
        </div>
        <div style={{ background: '#111111', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <SettingRow label="1時間あたりの消化ゲーム数" description="実戦ペースに合わせて調整">
            <NumberInput value={settings.gamesPerHour} onChange={(v) => update('gamesPerHour', v)} min={200} max={600} step={10} />
          </SettingRow>
          <SettingRow label="見込みロス時間" description="休憩・移動などの非遊技時間（分）">
            <NumberInput value={settings.estimatedLossMinutes} onChange={(v) => update('estimatedLossMinutes', v)} min={0} max={120} step={5} />
          </SettingRow>
          <SettingRow label="残り時間の初期値（時間）" description="計算画面を開いたときの初期値">
            <NumberInput value={settings.defaultRemainingHours} onChange={(v) => update('defaultRemainingHours', v)} min={0.5} max={12} step={0.5} />
          </SettingRow>
        </div>

        {/* ── 推測設定 ── */}
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-xs font-semibold text-[#c9962a] tracking-widest uppercase">設定推測モデル</h2>
        </div>
        <div style={{ background: '#111111', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <SettingRow label="設定推測の事前分布" description="ホールの傾向に合わせて選択">
            <SelectInput
              value={settings.priorDistribution}
              onChange={(v) => update('priorDistribution', v)}
              options={[
                { value: 'realistic', label: '現実的' },
                { value: 'uniform', label: '均等分布' },
                { value: 'optimistic', label: '楽観的' },
              ]}
            />
          </SettingRow>
        </div>

        {/* Save button */}
        <div className="px-4 pt-6">
          <button
            type="button"
            onClick={handleSave}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm transition-all active:scale-[0.98]"
            style={{
              background: saved
                ? 'linear-gradient(90deg, #2a5a2a, #3a7a3a)'
                : 'linear-gradient(90deg, #b8860b, #c9962a)',
              color: '#080808',
              boxShadow: saved ? '0 4px 20px rgba(58,122,58,0.3)' : '0 4px 20px rgba(201,150,42,0.35)',
            }}
          >
            {saved ? (
              <>
                <Check size={18} />
                保存しました
              </>
            ) : (
              '設定を保存する'
            )}
          </button>
        </div>

        {/* App info */}
        <div className="px-4 pt-10 pb-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <CompassLogo size={32} />
            <div>
              <p className="text-sm font-bold text-white tracking-widest" style={{ fontFamily: 'serif' }}>SLOT COMPASS</p>
              <p className="text-[9px] text-[#c9962a] tracking-widest">EXPECT VALUE NAVIGATION</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-white/20 leading-relaxed">
            本アプリは個人利用を目的とした期待値計算ツールです。<br />
            掲載されている機械割は理論値であり、実際の出玉を保証するものではありません。
          </p>
        </div>
      </div>
    </div>
  );
}
