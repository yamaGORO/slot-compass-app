'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMachineById } from '@/data/pachinko/machines';
import { getCurrentResult } from '@/lib/pachinko/store';
import {
  RetroButton,
  RetroDataRow,
  RetroMessage,
  RetroMetric,
  RetroPage,
  RetroPanel,
} from '@/components/ui/Retro';
import type { CalculationResult } from '@/types/pachinko';

function formatEV(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
}

function getCalculationModelLabel(model: string): string {
  if (model === 'pachinko-source-average-v2') {
    return '初当り平均出玉';
  }

  return model;
}

function SettingLine({ label, probability }: { label: string; probability: number }) {
  const pct = Math.round(probability * 100);
  return (
    <div className="grid grid-cols-[42px_1fr_42px] items-center gap-2">
      <span className="retro-label text-right">評{label}</span>
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
      router.replace('/pachinko/calculation');
      return;
    }
    setResult(current);
  }, [router]);

  if (!result) {
    return <div className="min-h-screen bg-[#020413]" />;
  }

  const machine = getMachineById(result.machineId);
  const dist = result.settingDistribution;
  const expectedValuePerHour =
    result.expectedValuePerHour ||
    result.expectedValue / Math.max(0.1, Number.parseFloat(result.inputs.remainingHours || '') || 3);
  const inputCount = Object.values(result.inputs).filter((value) => value !== '').length;
  const extraInputCount = Object.values(result.extraInputs).filter((value) => value !== '').length;
  const tone = result.expectedValue < 0 ? 'danger' : 'accent';
  const calculationProbabilityLabel = result.initialProbability
    ? `1/${result.initialProbability.toFixed(1)}`
    : machine?.probability ?? '--';
  const displayProbabilityLabel =
    machine?.initialProbability && machine.initialProbability !== result.initialProbability
      ? `1/${machine.initialProbability.toFixed(1)}`
      : '--';
  const expectedOutputLabel = result.expectedOutput
    ? Math.round(result.expectedOutput).toLocaleString('ja-JP')
    : machine?.expectedOutput
      ? Math.round(machine.expectedOutput).toLocaleString('ja-JP')
      : '--';
  const expectedBallsPerStartLabel = result.expectedBallsPerStart
    ? result.expectedBallsPerStart.toFixed(2)
    : '--';
  const jackpotOutputLabel = machine?.jackpotOutputValues?.length
    ? machine.jackpotOutputValues.join('/')
    : '--';
  const rushOutputLabel = machine?.rushAverageOutput
    ? machine.rushAverageOutput.toLocaleString('ja-JP')
    : '--';
  const ltEntryOutputLabel = machine?.ltEntryOutput
    ? machine.ltEntryOutput.toLocaleString('ja-JP')
    : '--';
  const rushRateLabel = machine?.rushRate && machine.rushRate !== '-' ? machine.rushRate : '--';
  const calculationModelLabel = getCalculationModelLabel(result.calculationModel);

  return (
    <RetroPage
      brandTitle="PACHINKO COMPASS"
      systemLabel="BORDER REPORT SYSTEM"
      reportTitle="期待値報告書"
      commands={[
        { label: '戻る', onClick: () => router.push('/pachinko/calculation') },
        { href: '/pachinko/settings', label: '設定' },
      ]}
      message="この画面は1000円あたり回転数、機種別の初当り確率・平均出玉、交換率から算出した報告書です。断定判断は表示しません。"
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
            <RetroMetric label="回転率評価" value={result.estimatedSetting.toFixed(1)} tone="accent" />
            <RetroMetric label="ボーダー比率" value={result.estimatedPayback.toFixed(1)} unit="%" />
            <RetroMetric label="プラス期待度" value={`${Math.round(result.highSettingProbability * 100)}`} unit="%" />
            <RetroMetric label="強プラス期待度" value={`${Math.round(result.veryHighSettingProbability * 100)}`} unit="%" />
          </div>
        </div>
      </RetroPanel>

      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <RetroPanel title="回転率評価分布">
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
            <RetroMetric label="データ状態" value={machine?.sourceLabel ?? '未確認'} />
            <RetroMetric label="出典確認日" value="2026-07-01" />
            <RetroMetric label="機種情報" value={machine?.category ?? '不明'} />
            <RetroMetric label="算出ボーダー" value={result.borderRate ? `${result.borderRate.toFixed(1)}` : '--'} unit="回/千円" />
            <RetroMetric label="実測回転率" value={result.actualSpinRate ? `${result.actualSpinRate}` : '--'} unit="回/千円" />
            <RetroMetric label="ボーダー差" value={`${result.borderGap.toFixed(1)}`} unit="回/千円" tone={result.borderGap >= 0 ? 'accent' : 'danger'} />
            <RetroMetric label="計算用確率" value={calculationProbabilityLabel} />
            <RetroMetric label="図柄揃い確率" value={displayProbabilityLabel} />
            <RetroMetric label="初当り平均出玉" value={expectedOutputLabel} unit="玉" />
            <RetroMetric label="大当り出玉" value={jackpotOutputLabel} unit="玉" />
            <RetroMetric label="突入/継続率" value={rushRateLabel} />
            <RetroMetric label="RUSH出玉" value={rushOutputLabel} unit="玉" />
            <RetroMetric label="LT突入出玉" value={ltEntryOutputLabel} unit="玉" />
            <RetroMetric label="1回転期待出玉" value={expectedBallsPerStartLabel} unit="玉" />
            <RetroMetric label="計算モデル" value={calculationModelLabel} />
          </div>
        </RetroPanel>
      </div>

      {result.stateExpectedValues && (
        <RetroPanel title="補足情報">
          <div className="grid gap-3 md:grid-cols-3">
            <RetroMetric
              label="想定通常回転数"
              value={Math.round(result.projectedStarts).toLocaleString('ja-JP')}
              unit="回"
            />
            {result.stateExpectedValues?.map((state) => (
              <RetroMetric
                key={state.label}
                label={state.label}
                value={state.unit === '円' ? formatEV(state.value) : state.value.toFixed(1)}
                unit={state.unit}
                tone={state.value >= 0 ? 'accent' : 'danger'}
              />
            ))}
          </div>
        </RetroPanel>
      )}

      <RetroPanel title="使用入力データ">
        <div className="grid gap-x-5 md:grid-cols-2">
          <RetroDataRow label="総通常回転数"><span className="retro-value">{result.inputs.totalGames || '--'} 回</span></RetroDataRow>
          <RetroDataRow label="現在の回転数"><span className="retro-value">{result.inputs.currentGames || '--'} 回</span></RetroDataRow>
          <RetroDataRow label="1000円あたり"><span className="retro-value">{result.inputs.spinsPer1000Yen || '--'} 回</span></RetroDataRow>
          <RetroDataRow label="大当り回数"><span className="retro-value">{result.inputs.bbCount || '--'} 回</span></RetroDataRow>
          <RetroDataRow label="初当り回数"><span className="retro-value">{result.inputs.rbCount || '--'} 回</span></RetroDataRow>
        </div>
      </RetroPanel>

      {machine?.referenceUrl && (
        <RetroPanel title="参照情報">
          <RetroDataRow label="スペック参考URL">
            <a className="retro-value break-all underline" href={machine.referenceUrl} target="_blank" rel="noreferrer">
              {machine.referenceUrl}
            </a>
          </RetroDataRow>
        </RetroPanel>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <RetroButton onClick={() => router.push('/pachinko/calculation')}>再計算する</RetroButton>
        <RetroButton onClick={() => router.push('/pachinko')}>ホームに戻る</RetroButton>
      </div>

      {!result.inputs.spinsPer1000Yen && (
        <RetroMessage>
          1000円あたり回転数を入力すると、機種スペックと交換率を使って期待値を算出します。
        </RetroMessage>
      )}
    </RetroPage>
  );
}
