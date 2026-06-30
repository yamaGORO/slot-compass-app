import type { AppSettings } from '@/types';

export const PLACEHOLDER_CALCULATION_MODEL = 'placeholder-v2';

export const PLACEHOLDER_PRIOR_DISTRIBUTIONS: Record<
  AppSettings['priorDistribution'],
  [number, number, number, number, number, number]
> = {
  uniform: [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6],
  realistic: [0.35, 0.25, 0.18, 0.12, 0.06, 0.04],
  optimistic: [0.20, 0.18, 0.18, 0.18, 0.14, 0.12],
};

export const PLACEHOLDER_PROBABILITY_FALLBACKS = {
  bb: 1 / 300,
  rb: 1 / 400,
};

export const PLACEHOLDER_SMART_SLOT_STATE_BONUS_YEN = 800;
