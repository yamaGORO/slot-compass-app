'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMachineById } from '@/data/machines';
import { getCurrentResult } from '@/lib/store';
import {
  RetroButton,
  RetroDataRow,
  RetroMessage,
  RetroMetric,
  RetroPage,
  RetroPanel,
} from '@/components/ui/Retro';
import type { CalculationResult } from '@/types';

function formatEV(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
}

function SettingLine({ label, probability }: { label: string; probability: number }) {
  const pct = Math.round(probability * 100);
  return (
    <div className="grid grid-cols-[42px_1fr_42px] items-center gap-2">
      <span className="retro-label text-right">設{label}</span>
      <div className="h-4 border-2 border-[#f8fbff] bg-[#030c4b] shadow-[inset_2px_2px_0_#010522]">
        <div
          className="h-full bg-[#f8fbff]"
          style={{ width: `${pct}%`, boxShadow: 'inset -2px -2px 0 #9fb0dd' }}
        />
      </div>
      <span className="retro-value text-right text-xs">{pct}%</span>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const current = getCurrentResult();
    if (!current) {
      router.replace('/slot/calculation');
      return;
    }
    setResult(current);
  }, [router]);

  if (!result) {
    return <div className="min-h-screen bg-[#020413]" />;
  }

  const machine = getMachineById(result.machineId);
  const dist = result.settingDistribution;
  const isSmartSlot = Boolean(result.stateExpectedValues);
  const expectedValuePerHour =
    result.expectedValuePerHour ||
    result.expectedValue / Math.max(0.1, Number.parseFloat(result.inputs.remainingHours || '') || 3);
  const inputCount = Object.values(result.inputs).filter((value) => value !== '').length;
  const extraInputCount = Object.values(result.extraInputs).filter((value) => value !== '').length;
  const tone = result.expectedValue < 0 ? 'danger' : 'accent';

  return (
    <RetroPage
      reportTitle="期待値報告書"
      commands={[
        { label: '戻る', onClick: () => router.push('/slot/calculation') },
        { href: '/slot/settings', label: '設定' },
      ]}
      message="この画面は入力データから算出した報告書です。GO/STOP/ヤメ推奨などの断定判断は表示しません。"
    >
      <RetroPanel title={result.machineName}>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="text-center">
            <p className="retro-label mb-3">期待値（円）</p>
            <p className={`retro-big-number ${result.expectedValue < 0 ? 'text-[#ff8c8c]' : 'text-[#ffe17b]'}`}>
              {formatEV(result.expectedValue)}
            </p>
            <p className="retro-value mt-2 text-xl">円</p>
          </div>

          <div className="retro-box-grid lg:grid-cols-2">
            <RetroMetric label="予想設定" value={result.estimatedSetting.toFixed(1)} tone="accent" />
            <RetroMetric label="推定機械割" value={result.estimatedPayback.toFixed(1)} unit="%" />
            <RetroMetric label="設定4以上期待度" value={`${Math.round(result.highSettingProbability * 100)}`} unit="%" />
            <RetroMetric label="設定5以上期待度" value={`${Math.round(result.veryHighSettingProbability * 100)}`} unit="%" />
          </div>
        </div>
      </RetroPanel>

      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <RetroPanel title="設定分布">
          <div className="space-y-3">
            {[
              { label: '1', prob: dist.s1 },
              { label: '2', prob: dist.s2 },
              { label: '3', prob: dist.s3 },
              { label: '4', prob: dist.s4 },
              { label: '5', prob: dist.s5 },
              { label: '6', prob: dist.s6 },
            ].map(({ label, prob }) => (
              <SettingLine key={label} label={label} probability={prob} />
            ))}
          </div>
        </RetroPanel>

        <RetroPanel title="サブ情報">
          <div className="retro-box-grid">
            <RetroMetric label="時間期待値" value={formatEV(expectedValuePerHour)} unit="円/h" tone={tone} />
            <RetroMetric label="使用入力項目" value={`${inputCount + extraInputCount}`} unit="件" />
            <RetroMetric label="データ状態" value={machine?.paybackRates.every((rate) => rate === 100) ? '検証中' : '有効'} />
            <RetroMetric label="出典確認日" value="参照データ" />
            <RetroMetric label="機種情報" value={machine?.category ?? '不明'} />
            <RetroMetric label="天井情報" value={machine?.ceilingGames ? `${machine.ceilingGames}G` : 'なし'} />
            <RetroMetric label="設定差要点" value={machine?.bbProbability || machine?.rbProbability ? 'BB/RB' : '未登録'} />
            <RetroMetric label="計算モデル" value="仮分離" />
          </div>
        </RetroPanel>
      </div>

      {isSmartSlot && (
        <RetroPanel title="スマスロ補足情報">
          <div className="grid gap-3 md:grid-cols-3">
            <RetroMetric
              label="天井までの残りG数"
              value={result.remainingToCeiling != null ? String(result.remainingToCeiling) : '--'}
              unit="G"
            />
            {result.stateExpectedValues?.map((state) => (
              <RetroMetric
                key={state.label}
                label={state.label}
                value={formatEV(state.value)}
                unit="円"
                tone={state.value >= 0 ? 'accent' : 'danger'}
              />
            ))}
            <RetroMetric label="やめどき情報" value="断定なし" />
          </div>
        </RetroPanel>
      )}

      <RetroPanel title="使用入力データ">
        <div className="grid gap-x-5 md:grid-cols-2">
          <RetroDataRow label="総回転数"><span className="retro-value">{result.inputs.totalGames || '--'} G</span></RetroDataRow>
          <RetroDataRow label="現在の回転数"><span className="retro-value">{result.inputs.currentGames || '--'} G</span></RetroDataRow>
          <RetroDataRow label="BB回数"><span className="retro-value">{result.inputs.bbCount || '--'} 回</span></RetroDataRow>
          <RetroDataRow label="RB回数"><span className="retro-value">{result.inputs.rbCount || '--'} 回</span></RetroDataRow>
        </div>
      </RetroPanel>

      <div className="grid gap-2 sm:grid-cols-2">
        <RetroButton onClick={() => router.push('/slot/calculation')}>再計算する</RetroButton>
        <RetroButton onClick={() => router.push('/slot')}>ホームに戻る</RetroButton>
      </div>

      {!result.inputs.bbCount && !result.inputs.rbCount && (
        <RetroMessage>
          BB・RB回数を入力すると、設定推測の精度が上がります。現在は入力済みデータのみで算出しています。
        </RetroMessage>
      )}
    </RetroPage>
  );
}
