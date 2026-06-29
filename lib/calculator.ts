/**
 * Slot Compass calculation facade.
 *
 * UI code should keep importing from this file. The active implementation is
 * currently a placeholder engine; swap the delegated function below when a
 * production calculation engine is ready.
 */

import { calculateWithPlaceholderEngine } from '@/lib/calculation/placeholder-engine';
import type { AppSettings, CalculationResult, CommonInputs, ExtraInputs, Machine } from '@/types';

export function calculateExpectedValue(
  machine: Machine,
  inputs: CommonInputs,
  extraInputs: ExtraInputs,
  settings: AppSettings,
): CalculationResult {
  return calculateWithPlaceholderEngine({ machine, inputs, extraInputs, settings });
}

export function generateChartData(result: CalculationResult, totalHours = 5) {
  const points: { time: string; value: number }[] = [];
  const baseRemainingHours =
    Number.parseFloat(result.inputs.remainingHours || '') +
    Number.parseFloat(result.inputs.remainingMinutes || '') / 60;
  const evPerHour = result.expectedValuePerHour || result.expectedValue / Math.max(0.1, baseRemainingHours || 3);

  for (let h = 0; h <= totalHours; h += 0.25) {
    const noise = (Math.random() - 0.5) * Math.abs(evPerHour) * 0.3;
    points.push({
      time: `${h}h`,
      value: Math.round(evPerHour * h + noise),
    });
  }
  return points;
}
