'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MACHINES, getMachineById } from '@/data/pachinko/machines';
import { calculateExpectedValue } from '@/lib/pachinko/calculator';
import { addToHistory, getSettings, saveCurrentResult, setRecentMachineId } from '@/lib/pachinko/store';
import {
  RetroButton,
  RetroDataRow,
  RetroInput,
  RetroMetric,
  RetroPage,
  RetroPanel,
  RetroSelect,
} from '@/components/ui/Retro';
import type { CommonInputs, ExtraInputs } from '@/types/pachinko';

function TimeField({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}: {
  hours: string;
  minutes: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <RetroInput value={hours} onChange={onHoursChange} unit="時" ariaLabel="残り時間（時間）" inputMode="numeric" />
      <RetroInput value={minutes} onChange={onMinutesChange} unit="分" ariaLabel="残り時間（分）" inputMode="numeric" />
    </div>
  );
}

function formatProbabilityDenominator(value?: number): string {
  return value && value > 0 ? `1/${value.toFixed(1)}` : '--';
}

function CalculationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMachineId = searchParams.get('machine') ?? '';

  const [selectedMachineId, setSelectedMachineId] = useState(initialMachineId);
  const [inputs, setInputs] = useState<CommonInputs>({
    totalGames: '',
    currentGames: '',
    spinsPer1000Yen: '',
    bbCount: '',
    rbCount: '',
    remainingHours: '',
    remainingMinutes: '',
  });
  const [extraInputs, setExtraInputs] = useState<ExtraInputs>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const machine = getMachineById(selectedMachineId);

  useEffect(() => {
    const settings = getSettings();
    setInputs((prev) => ({
      ...prev,
      remainingHours: settings.defaultRemainingHours > 0 ? String(settings.defaultRemainingHours) : '',
      remainingMinutes: '',
    }));
  }, []);

  const setCommon = (key: keyof CommonInputs) => (value: string) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const setExtra = (key: string) => (value: string) =>
    setExtraInputs((prev) => ({ ...prev, [key]: value }));

  const getNormalizedExtraInputs = useCallback(() => {
    if (!machine) return extraInputs;

    return machine.extraFields.reduce<ExtraInputs>((acc, field) => {
      acc[field.key] =
        field.type === 'select'
          ? extraInputs[field.key] || field.options?.[0] || ''
          : extraInputs[field.key] ?? '';
      return acc;
    }, {});
  }, [machine, extraInputs]);

  const handleReset = () => {
    setInputs({
      totalGames: '',
      currentGames: '',
      spinsPer1000Yen: '',
      bbCount: '',
      rbCount: '',
      remainingHours: '',
      remainingMinutes: '',
    });
    setExtraInputs({});
  };

  const hasMinimumData = Boolean(
    selectedMachineId &&
    inputs.spinsPer1000Yen &&
    Number(inputs.spinsPer1000Yen) > 0,
  );

  const handleCalculate = useCallback(() => {
    if (!machine || !hasMinimumData || isCalculating) return;
    setIsCalculating(true);
    const settings = getSettings();
    const normalizedExtraInputs = getNormalizedExtraInputs();
    const result = calculateExpectedValue(machine, inputs, normalizedExtraInputs, settings);
    saveCurrentResult(result);
    addToHistory(result);
    setRecentMachineId(machine.id);
    setTimeout(() => {
      setIsCalculating(false);
      router.push('/pachinko/result');
    }, 250);
  }, [machine, hasMinimumData, isCalculating, getNormalizedExtraInputs, inputs, router]);

  useEffect(() => {
    window.addEventListener('pachinko-compass:calculate', handleCalculate);
    return () => window.removeEventListener('pachinko-compass:calculate', handleCalculate);
  }, [handleCalculate]);

  const firstHitRatio =
    inputs.totalGames && Number(inputs.rbCount) > 0
      ? `1/${(Number(inputs.totalGames) / Number(inputs.rbCount)).toFixed(1)}`
      : '--';

  const message = !machine
    ? '機種を選択すると、必要な入力項目が表示されます。'
    : !hasMinimumData
      ? '1000円あたり回転数を入力すると、期待値報告書を作成できます。'
      : machine.extraFields.length > 0
        ? '右打ち状態や遊タイム情報を入力すると、補足精度が上がります。'
        : '入力内容を確認して、期待値報告書を作成してください。';

  return (
    <RetroPage
      brandTitle="PACHINKO COMPASS"
      systemLabel="BORDER REPORT SYSTEM"
      reportTitle="データ入力"
      commands={[
        { href: '/pachinko/history', label: '履歴' },
        { href: '/pachinko/settings', label: '設定' },
      ]}
      message={message}
    >
      <form
        id="pachinko-compass-calculation-form"
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          handleCalculate();
        }}
      >
        <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <RetroPanel title="機種選択">
            <RetroDataRow label="対象機種" description="Excel取り込み済み機種を単一リストで表示">
              <RetroSelect
                value={selectedMachineId}
                onChange={(value) => {
                  setSelectedMachineId(value);
                  setExtraInputs({});
                }}
                ariaLabel="機種を選択"
                options={[
                  { value: '', label: '機種を選択' },
                  ...MACHINES.map((m) => ({ value: m.id, label: m.name })),
                ]}
              />
            </RetroDataRow>

            {machine ? (
              <div className="retro-box-grid mt-4">
                <RetroMetric label="メーカー" value={machine.maker} />
                <RetroMetric label="分類" value={machine.category} />
                <RetroMetric label="専用項目" value={`${machine.extraFields.length}`} unit="件" />
                <RetroMetric label="目安ボーダー" value={`${machine.borderRate}`} unit="回/千円" />
                <RetroMetric label="大当り確率" value={machine.probability} />
                <RetroMetric label="計算用確率" value={formatProbabilityDenominator(machine.calculationProbability ?? machine.initialProbability)} />
                <RetroMetric label="初当り平均" value={machine.initialAverageOutput ? `${machine.initialAverageOutput.toLocaleString('ja-JP')}` : '--'} unit="玉" />
                <RetroMetric label="大当り出玉" value={machine.jackpotOutputValues?.length ? machine.jackpotOutputValues.join('/') : '--'} unit="玉" />
                <RetroMetric label="突入/継続率" value={machine.rushRate && machine.rushRate !== '-' ? machine.rushRate : '--'} />
                <RetroMetric label="RUSH出玉" value={machine.rushAverageOutput ? machine.rushAverageOutput.toLocaleString('ja-JP') : '--'} unit="玉" />
                <RetroMetric label="LT突入出玉" value={machine.ltEntryOutput ? machine.ltEntryOutput.toLocaleString('ja-JP') : '--'} unit="玉" />
                <RetroMetric label="初当り" value={firstHitRatio} />
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="retro-value text-xl">NO MACHINE</p>
                <p className="retro-label mt-3">機種未選択のため入力欄は待機中です。</p>
              </div>
            )}
          </RetroPanel>

          {machine && (
            <RetroPanel title="実戦データ入力">
              <div className="space-y-0">
                <RetroDataRow label="総通常回転数">
                  <RetroInput value={inputs.totalGames} onChange={setCommon('totalGames')} unit="回" ariaLabel="総通常回転数" inputMode="numeric" />
                </RetroDataRow>
                <RetroDataRow label="現在の回転数">
                  <RetroInput value={inputs.currentGames} onChange={setCommon('currentGames')} unit="回" ariaLabel="現在の回転数" inputMode="numeric" />
                </RetroDataRow>
                <RetroDataRow label="1000円あたり回転数">
                  <RetroInput value={inputs.spinsPer1000Yen} onChange={setCommon('spinsPer1000Yen')} unit="回" ariaLabel="1000円あたり回転数" inputMode="decimal" />
                </RetroDataRow>
                <RetroDataRow label="大当り回数">
                  <RetroInput value={inputs.bbCount} onChange={setCommon('bbCount')} unit="回" ariaLabel="大当り回数" inputMode="numeric" />
                </RetroDataRow>
                <RetroDataRow label="初当り回数">
                  <RetroInput value={inputs.rbCount} onChange={setCommon('rbCount')} unit="回" ariaLabel="初当り回数" inputMode="numeric" />
                </RetroDataRow>
                <RetroDataRow label="残り時間">
                  <TimeField
                    hours={inputs.remainingHours}
                    minutes={inputs.remainingMinutes}
                    onHoursChange={setCommon('remainingHours')}
                    onMinutesChange={setCommon('remainingMinutes')}
                  />
                </RetroDataRow>
              </div>
            </RetroPanel>
          )}
        </div>

        {machine && machine.extraFields.length > 0 && (
          <RetroPanel title={`${machine.name} 専用データ`}>
            <div className="grid gap-x-5 lg:grid-cols-2">
              {machine.extraFields.map((field) => (
                <RetroDataRow key={field.key} label={field.label} description={field.description}>
                  {field.type === 'select' ? (
                    <RetroSelect
                      value={extraInputs[field.key] || field.options?.[0] || ''}
                      onChange={setExtra(field.key)}
                      ariaLabel={field.label}
                      options={(field.options ?? []).map((option) => ({ value: option, label: option }))}
                    />
                  ) : (
                    <RetroInput
                      value={extraInputs[field.key] ?? ''}
                      onChange={setExtra(field.key)}
                      unit={field.unit}
                      ariaLabel={field.label}
                      inputMode="numeric"
                    />
                  )}
                </RetroDataRow>
              ))}
            </div>
          </RetroPanel>
        )}

        {machine && (
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <RetroPanel title="入力状態">
              <div className="retro-box-grid">
                <RetroMetric label="共通項目" value="6" unit="件" />
                <RetroMetric label="専用項目" value={`${machine.extraFields.length}`} unit="件" />
                <RetroMetric label="データ状態" value={hasMinimumData ? 'READY' : 'WAIT'} tone={hasMinimumData ? 'accent' : 'normal'} />
                <RetroMetric label="検証" value="DMM参照" />
              </div>
            </RetroPanel>

            <div className="flex gap-2 sm:flex-col">
              <RetroButton onClick={handleReset} className="flex-1 sm:w-36">
                リセット
              </RetroButton>
              <RetroButton type="submit" disabled={!hasMinimumData || isCalculating} className="flex-1 sm:w-36">
                {isCalculating ? '計算中' : '計算する'}
              </RetroButton>
            </div>
          </div>
        )}
      </form>
    </RetroPage>
  );
}

export default function CalculationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020413]" />}>
      <CalculationContent />
    </Suspense>
  );
}
