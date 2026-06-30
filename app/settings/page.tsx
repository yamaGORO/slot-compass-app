'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/lib/store';
import {
  RetroButton,
  RetroDataRow,
  RetroInput,
  RetroMetric,
  RetroPage,
  RetroPanel,
  RetroSelect,
} from '@/components/ui/Retro';
import type { AppSettings } from '@/types';

function NumberSetting({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}) {
  return (
    <RetroInput
      value={String(value)}
      onChange={(next) => {
        const parsed = Number(next);
        if (!Number.isFinite(parsed)) return;
        const clampedMin = min == null ? parsed : Math.max(min, parsed);
        const clamped = max == null ? clampedMin : Math.min(max, clampedMin);
        onChange(step < 1 ? Math.round(clamped / step) * step : clamped);
      }}
      inputMode="decimal"
      ariaLabel={label}
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="retro-command min-w-24"
    >
      {checked ? 'ON' : 'OFF'}
    </button>
  );
}

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

  if (!settings) return <div className="min-h-screen bg-[#020413]" />;

  return (
    <RetroPage
      reportTitle="設定"
      commands={[
        { href: '/history', label: '履歴' },
        { href: '/calculation', label: '入力' },
      ]}
      message="設定値は端末内に保存されます。貸しメダル、交換率、消化速度を実戦環境に合わせて調整してください。"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <RetroPanel title="ホール設定">
          <RetroDataRow label="貸しメダル" description="1枚あたりの金額（円）">
            <NumberSetting value={settings.medalRate} onChange={(v) => update('medalRate', v)} min={1} max={50} label="貸しメダル" />
          </RetroDataRow>
          <RetroDataRow label="交換率" description="メダル何枚で1円に交換できるか">
            <NumberSetting value={settings.exchangeRate} onChange={(v) => update('exchangeRate', v)} min={1} max={10} step={0.1} label="交換率" />
          </RetroDataRow>
          <RetroDataRow label="持ちメダル優先" description="持ちメダルがある場合に優先使用">
            <Toggle checked={settings.useCashMedals} onChange={(v) => update('useCashMedals', v)} />
          </RetroDataRow>
        </RetroPanel>

        <RetroPanel title="計算設定">
          <RetroDataRow label="1時間あたりの消化ゲーム数" description="実戦ペースに合わせて調整">
            <NumberSetting value={settings.gamesPerHour} onChange={(v) => update('gamesPerHour', v)} min={200} max={600} step={10} label="1時間あたりの消化ゲーム数" />
          </RetroDataRow>
          <RetroDataRow label="見込みロス時間" description="休憩・移動などの非遊技時間（分）">
            <NumberSetting value={settings.estimatedLossMinutes} onChange={(v) => update('estimatedLossMinutes', v)} min={0} max={120} step={5} label="見込みロス時間" />
          </RetroDataRow>
          <RetroDataRow label="残り時間の初期値" description="計算画面を開いたときの初期値（時間）">
            <NumberSetting value={settings.defaultRemainingHours} onChange={(v) => update('defaultRemainingHours', v)} min={0} max={12} step={0.5} label="残り時間の初期値" />
          </RetroDataRow>
        </RetroPanel>
      </div>

      <RetroPanel title="設定推測モデル">
        <RetroDataRow label="設定推測の事前分布" description="ホール傾向に合わせた初期分布">
          <RetroSelect
            value={settings.priorDistribution}
            onChange={(value) => update('priorDistribution', value as AppSettings['priorDistribution'])}
            ariaLabel="設定推測の事前分布"
            options={[
              { value: 'realistic', label: '現実的' },
              { value: 'uniform', label: '均等分布' },
              { value: 'optimistic', label: '楽観的' },
            ]}
          />
        </RetroDataRow>

        <div className="retro-box-grid mt-4">
          <RetroMetric label="貸しメダル" value={`${settings.medalRate}`} unit="円" />
          <RetroMetric label="交換率" value={`${settings.exchangeRate}`} unit="枚" />
          <RetroMetric label="消化速度" value={`${settings.gamesPerHour}`} unit="G/h" />
          <RetroMetric label="ロス時間" value={`${settings.estimatedLossMinutes}`} unit="分" />
        </div>
      </RetroPanel>

      <RetroButton onClick={handleSave} className="w-full">
        {saved ? '保存しました' : '設定を保存する'}
      </RetroButton>

      <RetroPanel title="アプリ情報">
        <p className="retro-value text-lg">SLOT COMPASS</p>
        <p className="retro-label mt-2 leading-relaxed">
          個人利用を目的とした期待値計算ツールです。掲載されている機械割は理論値であり、実際の出玉を保証するものではありません。
        </p>
      </RetroPanel>
    </RetroPage>
  );
}
