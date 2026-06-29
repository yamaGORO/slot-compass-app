import {
  PLACEHOLDER_CALCULATION_MODEL,
  PLACEHOLDER_PRIOR_DISTRIBUTIONS,
  PLACEHOLDER_PROBABILITY_FALLBACKS,
  PLACEHOLDER_SMART_SLOT_STATE_BONUS_YEN,
} from '@/data/calculation-placeholder';
import type {
  AppSettings,
  CalculationResult,
  CommonInputs,
  ExtraInputs,
  Machine,
  SettingDistribution,
} from '@/types';

type CalculationRequest = {
  machine: Machine;
  inputs: CommonInputs;
  extraInputs: ExtraInputs;
  settings: AppSettings;
};

const settingKeys: (keyof SettingDistribution)[] = ['s1', 's2', 's3', 's4', 's5', 's6'];

const safe = (value: string | undefined): number => {
  const n = Number.parseFloat(value ?? '');
  return Number.isFinite(n) ? n : 0;
};

function normalizeLogLikelihoods(logLikelihoods: number[]): number[] {
  const max = Math.max(...logLikelihoods);
  const likelihoods = logLikelihoods.map((value) => Math.exp(value - max));
  const sum = likelihoods.reduce((acc, value) => acc + value, 0) || 1;
  return likelihoods.map((value) => value / sum);
}

function computePosterior(
  machine: Machine,
  totalGames: number,
  bbCount: number,
  rbCount: number,
  priorKey: AppSettings['priorDistribution'],
): SettingDistribution {
  const prior = PLACEHOLDER_PRIOR_DISTRIBUTIONS[priorKey];

  const logLikelihoods = settingKeys.map((_, i) => {
    const bbProb = machine.bbProbability?.[i] ?? PLACEHOLDER_PROBABILITY_FALLBACKS.bb;
    const rbProb = machine.rbProbability?.[i] ?? PLACEHOLDER_PROBABILITY_FALLBACKS.rb;
    const bbMisses = Math.max(0, totalGames - bbCount);
    const rbMisses = Math.max(0, totalGames - rbCount);

    return (
      Math.log(prior[i]) +
      bbCount * Math.log(bbProb) +
      bbMisses * Math.log(1 - bbProb) +
      rbCount * Math.log(rbProb) +
      rbMisses * Math.log(1 - rbProb)
    );
  });

  const normalized = normalizeLogLikelihoods(logLikelihoods);

  return {
    s1: normalized[0],
    s2: normalized[1],
    s3: normalized[2],
    s4: normalized[3],
    s5: normalized[4],
    s6: normalized[5],
  };
}

function estimatePayback(machine: Machine, dist: SettingDistribution): number {
  const vals = [dist.s1, dist.s2, dist.s3, dist.s4, dist.s5, dist.s6];
  return machine.paybackRates.reduce((acc, rate, i) => acc + rate * vals[i], 0);
}

function estimatedSettingMean(dist: SettingDistribution): number {
  const vals = [dist.s1, dist.s2, dist.s3, dist.s4, dist.s5, dist.s6];
  return vals.reduce((acc, p, i) => acc + p * (i + 1), 0);
}

export function calculateWithPlaceholderEngine({
  machine,
  inputs,
  extraInputs,
  settings,
}: CalculationRequest): CalculationResult {
  const totalGames = safe(inputs.totalGames);
  const bbCount = safe(inputs.bbCount);
  const rbCount = safe(inputs.rbCount);
  const remainingHours = safe(inputs.remainingHours) + safe(inputs.remainingMinutes) / 60;
  const gamesPerHour = settings.gamesPerHour;
  const medalRate = settings.medalRate;
  const exchangeRate = settings.exchangeRate;

  const dist = computePosterior(
    machine,
    totalGames,
    bbCount,
    rbCount,
    settings.priorDistribution,
  );

  const estimatedPayback = estimatePayback(machine, dist);
  const estimatedSetting = estimatedSettingMean(dist);

  const expectedValuePerHour =
    ((estimatedPayback / 100 - 1) * gamesPerHour * medalRate) / exchangeRate;
  const effectiveHours = Math.max(0, remainingHours - settings.estimatedLossMinutes / 60);
  const expectedValue = expectedValuePerHour * effectiveHours;

  const highSettingProbability = dist.s4 + dist.s5 + dist.s6;
  const veryHighSettingProbability = dist.s5 + dist.s6;

  const isAType = machine.category === 'Aタイプ';
  const atIntervalGames = safe(extraInputs.atIntervalGames || inputs.currentGames);
  const ceiling = machine.ceilingGames ?? 1600;
  const remainingToBonus = isAType ? undefined : Math.max(0, ceiling - atIntervalGames);

  const stateExpectedValues = isAType
    ? undefined
    : [
        {
          label: '現在状態',
          value:
            expectedValuePerHour +
            (remainingToBonus != null && remainingToBonus < 200
              ? PLACEHOLDER_SMART_SLOT_STATE_BONUS_YEN
              : 0),
        },
      ];

  return {
    machineId: machine.id,
    machineName: machine.name,
    timestamp: Date.now(),
    calculationModel: PLACEHOLDER_CALCULATION_MODEL,
    inputs,
    extraInputs,
    expectedValue,
    expectedValuePerHour,
    estimatedSetting,
    settingDistribution: dist,
    estimatedPayback,
    highSettingProbability,
    veryHighSettingProbability,
    remainingToBonus,
    remainingToCeiling: remainingToBonus,
    stateExpectedValues,
  };
}
