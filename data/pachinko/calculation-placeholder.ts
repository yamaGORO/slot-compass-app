import type { AppSettings } from '@/types/pachinko';

export const PLACEHOLDER_CALCULATION_MODEL = 'pachinko-source-average-v2';

export const PLACEHOLDER_PRIOR_DISTRIBUTIONS: Record<
  AppSettings['priorDistribution'],
  [number, number, number, number, number, number]
> = {
  uniform: [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6],
  realistic: [0.28, 0.24, 0.20, 0.14, 0.09, 0.05],
  optimistic: [0.12, 0.14, 0.18, 0.22, 0.18, 0.16],
};
