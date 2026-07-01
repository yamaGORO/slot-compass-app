'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MACHINES, getMachineById } from '@/data/machines';
import { calculateExpectedValue } from '@/lib/calculator';
import { addToHistory, getSettings, saveCurrentResult, setRecentMachineId } from '@/lib/store';
import {
  RetroButton,
  RetroDataRow,
  RetroInput,
  RetroMetric,
  RetroPage,
  RetroPanel,
  RetroSelect,
} from '@/components/ui/Retro';
import type { CommonInputs, ExtraInputs } from '@/types';

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
      bbCount: '',
      rbCount: '',
      remainingHours: '',
      remainingMinutes: '',
    });
    setExtraInputs({});
  };

  const hasMinimumData = Boolean(
    selectedMachineId &&
    inputs.totalGames &&
    Number(inputs.totalGames) > 0,
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
      router.push('/slot/result');
    }, 250);
  }, [machine, hasMinimumData, isCalculating, getNormalizedExtraInputs, inputs, router]);

  useEffect(() => {
    window.addEventListener('slot-compass:calculate', handleCalculate);
    return () => window.removeEventListener('slot-compass:calculate', handleCalculate);
  }, [handleCalculate]);

  const bonusCount = Number(inputs.bbCount) + Number(inputs.rbCount);
  const bonusRatio =
    inputs.totalGames && bonusCount > 0
      ? `1/${(Number(inputs.totalGames) / bonusCount).toFixed(1)}`
      : '--';

  const message = !machine
    ? '機種を選択すると、必要な入力項目が表示されます。'
    : !hasMinimumData
      ? '総回転数を入力すると、期待値報告書を作成できます。'
      : machine.extraFields.length > 0
        ? '追加データを入力すると、設定推測精度が上がります。'
        : '入力内容を確認して、期待値報告書を作成してください。';

  return (
    <RetroPage
      reportTitle="データ入力"
      commands={[
        { href: '/slot/history', label: '履歴' },
        { href: '/slot/settings', label: '設定' },
      ]}
      message={message}
    >
      <form
        id="slot-compass-calculation-form"
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          handleCalculate();
        }}
      >
        <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <RetroPanel title="機種選択">
            <RetroDataRow label="対象機種" description="Excel正本の20機種を単一リストで表示">
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
                <RetroMetric label="合算" value={bonusRatio} />
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
                <RetroDataRow label="総回転数">
                  <RetroInput value={inputs.totalGames} onChange={setCommon('totalGames')} unit="G" ariaLabel="総回転数" inputMode="numeric" />
                </RetroDataRow>
                <RetroDataRow label="現在の回転数">
                  <RetroInput value={inputs.currentGames} onChange={setCommon('currentGames')} unit="G" ariaLabel="現在の回転数" inputMode="numeric" />
                </RetroDataRow>
                <RetroDataRow label="BB回数">
                  <RetroInput value={inputs.bbCount} onChange={setCommon('bbCount')} unit="回" ariaLabel="BB回数" inputMode="numeric" />
                </RetroDataRow>
                <RetroDataRow label="RB回数">
                  <RetroInput value={inputs.rbCount} onChange={setCommon('rbCount')} unit="回" ariaLabel="RB回数" inputMode="numeric" />
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
                <RetroMetric label="共通項目" value="5" unit="件" />
                <RetroMetric label="専用項目" value={`${machine.extraFields.length}`} unit="件" />
                <RetroMetric label="データ状態" value={hasMinimumData ? 'READY' : 'WAIT'} tone={hasMinimumData ? 'accent' : 'normal'} />
                <RetroMetric label="検証" value="仮計算" />
              </div>
            </RetroPanel>

            <div className="flex gap-2 sm:flex-col">
              <RetroButton onClick={handleReset} className="flex-1 sm:w-36">
                リセット
              </RetroButton>
              <RetroButton type="submit" disabled={!hasMinimumData || isCalculating} className="flex-1 sm:w-36">
                {isCalculating ? '計算中' : '報告書作成'}
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
