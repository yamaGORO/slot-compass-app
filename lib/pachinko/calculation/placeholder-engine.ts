import {
  PLACEHOLDER_CALCULATION_MODEL,
  PLACEHOLDER_PRIOR_DISTRIBUTIONS,
} from '@/data/pachinko/calculation-placeholder';
import type {
  AppSettings,
  CalculationResult,
  CommonInputs,
  ExtraInputs,
  Machine,
  SettingDistribution,
} from '@/types/pachinko';

type CalculationRequest = {
  machine: Machine;
  inputs: CommonInputs;
  extraInputs: ExtraInputs;
  settings: AppSettings;
};

const settingKeys: (keyof SettingDistribution)[] = ['s1', 's2', 's3', 's4', 's5', 's6'];
const YEN_PER_RATE_UNIT = 1000;
const EXCHANGE_YEN_UNIT = 100;

const safe = (value: string | undefined): number => {
  const n = Number.parseFloat(value ?? '');
  return Number.isFinite(n) ? n : 0;
};

function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((acc, value) => acc + value, 0) || 1;
  return weights.map((value) => value / sum);
}

function computeValueDistribution(
  score: number,
  priorKey: AppSettings['priorDistribution'],
): SettingDistribution {
  const prior = PLACEHOLDER_PRIOR_DISTRIBUTIONS[priorKey];
  const sigma = 1.05;
  const weights = settingKeys.map((_, i) => {
    const grade = i + 1;
    const distance = grade - score;
    return prior[i] * Math.exp(-(distance * distance) / (2 * sigma * sigma));
  });
  const normalized = normalizeWeights(weights);

  return {
    s1: normalized[0],
    s2: normalized[1],
    s3: normalized[2],
    s4: normalized[3],
    s5: normalized[4],
    s6: normalized[5],
  };
}

function estimatedGradeMean(dist: SettingDistribution): number {
  const vals = [dist.s1, dist.s2, dist.s3, dist.s4, dist.s5, dist.s6];
  return vals.reduce((acc, p, i) => acc + p * (i + 1), 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getInitialProbability(machine: Machine): number {
  if (machine.calculationProbability && machine.calculationProbability > 0) {
    return machine.calculationProbability;
  }

  if (machine.initialProbability && machine.initialProbability > 0) {
    return machine.initialProbability;
  }

  const match = machine.probability.match(/1\s*\/\s*([0-9]+(?:\.[0-9]+)?)/);
  const parsed = match ? Number.parseFloat(match[1]) : 0;
  return parsed > 0 ? parsed : 319.7;
}

function getAdjustedExpectedOutput(machine: Machine, extraInputs: ExtraInputs): number {
  const baseOutput = machine.expectedOutput && machine.expectedOutput > 0 ? machine.expectedOutput : 4000;
  const supportMinus = safe(extraInputs.supportMinus);
  const overPrizeRate = safe(extraInputs.overPrize) / 100;
  const smallPrizeCount = safe(extraInputs.smallPrize);

  // These inputs are field observations, not official machine specs.
  // Keep their effect intentionally small until verified data is supplied.
  const supportAdjustment = Number.isFinite(supportMinus) ? supportMinus * -1.5 : 0;
  const overPrizeAdjustment = baseOutput * clamp(overPrizeRate, 0, 0.08);
  const smallPrizeAdjustment = smallPrizeCount * 3;

  return Math.max(100, baseOutput + supportAdjustment + overPrizeAdjustment + smallPrizeAdjustment);
}

function estimateExpectedValuePerHour({
  spinsPer1000Yen,
  initialProbability,
  expectedOutput,
  settings,
}: {
  spinsPer1000Yen: number;
  initialProbability: number;
  expectedOutput: number;
  settings: AppSettings;
}): {
  calculatedBorderRate: number;
  expectedBallsPerStart: number;
  expectedValuePerHour: number;
} {
  const startsPerHour = settings.startsPerHour;
  const measuredSpins = Math.max(0.1, spinsPer1000Yen);
  const ballsPer1000Yen = YEN_PER_RATE_UNIT / Math.max(0.1, settings.ballRate);
  const exchangeYenPerBall = EXCHANGE_YEN_UNIT / Math.max(0.1, settings.exchangeRate);
  const expectedBallsPerStart = expectedOutput / Math.max(0.1, initialProbability);
  const expectedPayoutYenPerStart = expectedBallsPerStart * exchangeYenPerBall;
  const cashCostPerStart = YEN_PER_RATE_UNIT / measuredSpins;
  const ownedBallCostPerStart = (ballsPer1000Yen / measuredSpins) * exchangeYenPerBall;
  const costPerStart = settings.useCashBalls ? ownedBallCostPerStart : cashCostPerStart;
  const expectedValuePerStart = expectedPayoutYenPerStart - costPerStart;

  const cashBorderRate = YEN_PER_RATE_UNIT / Math.max(0.01, expectedPayoutYenPerStart);
  const ownedBallBorderRate = ballsPer1000Yen / Math.max(0.01, expectedBallsPerStart);

  return {
    calculatedBorderRate: settings.useCashBalls ? ownedBallBorderRate : cashBorderRate,
    expectedBallsPerStart,
    expectedValuePerHour: expectedValuePerStart * startsPerHour,
  };
}

export function calculateWithPlaceholderEngine({
  machine,
  inputs,
  extraInputs,
  settings,
}: CalculationRequest): CalculationResult {
  const actualSpinRate = safe(inputs.spinsPer1000Yen);
  const initialProbability = getInitialProbability(machine);
  const expectedOutput = getAdjustedExpectedOutput(machine, extraInputs);
  const valueModel = estimateExpectedValuePerHour({
    spinsPer1000Yen: actualSpinRate,
    initialProbability,
    expectedOutput,
    settings,
  });
  const borderRate = valueModel.calculatedBorderRate > 0 ? valueModel.calculatedBorderRate : machine.borderRate;
  const borderGap = actualSpinRate - borderRate;
  const borderRatio = actualSpinRate > 0 ? (actualSpinRate / borderRate) * 100 : 0;
  const edgeRate = actualSpinRate > 0 ? actualSpinRate / borderRate - 1 : -0.2;
  const score = clamp(3.2 + edgeRate * 20, 1, 6);

  const dist = computeValueDistribution(score, settings.priorDistribution);
  const estimatedSetting = estimatedGradeMean(dist);
  const highSettingProbability = dist.s4 + dist.s5 + dist.s6;
  const veryHighSettingProbability = dist.s5 + dist.s6;

  const expectedValuePerHour = valueModel.expectedValuePerHour;
  const remainingHours = safe(inputs.remainingHours) + safe(inputs.remainingMinutes) / 60;
  const effectiveHours = Math.max(0, remainingHours - settings.estimatedLossMinutes / 60);
  const expectedValue = expectedValuePerHour * effectiveHours;
  const projectedStarts = settings.startsPerHour * effectiveHours;
  const stateExpectedValues = [
    { label: 'ボーダー差', value: borderGap, unit: '回/1000円' },
    { label: '計算用確率分母', value: initialProbability, unit: 'G' },
    { label: '初当り平均出玉', value: expectedOutput, unit: '玉' },
    { label: '1回転期待出玉', value: valueModel.expectedBallsPerStart, unit: '玉' },
  ];

  if (machine.rushAverageOutput && machine.rushAverageOutput > 0) {
    stateExpectedValues.push({
      label: 'RUSH中大当り出玉',
      value: machine.rushAverageOutput,
      unit: '玉',
    });
  }

  if (machine.ltEntryOutput && machine.ltEntryOutput > 0) {
    stateExpectedValues.push({
      label: 'LT突入時出玉',
      value: machine.ltEntryOutput,
      unit: '玉',
    });
  }

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
    estimatedPayback: borderRatio,
    highSettingProbability,
    veryHighSettingProbability,
    borderRate,
    actualSpinRate,
    borderGap,
    initialProbability,
    expectedOutput,
    expectedBallsPerStart: valueModel.expectedBallsPerStart,
    projectedStarts,
    stateExpectedValues,
  };
}
