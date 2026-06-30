// ─── Machine Types ────────────────────────────────────────────────────────────
export type MachineCategory = 'Aタイプ' | 'スマスロ' | 'AタイプAT' | 'AT機' | 'ART機';

export type MachineInputField = {
  key: string;
  label: string;
  unit: string;
  type?: 'number' | 'select';
  options?: string[];
  placeholder?: string;
  description?: string;
};

export type Machine = {
  id: string;
  name: string;
  maker: string;
  category: MachineCategory;
  subCategory?: string;
  releaseYear?: number;
  description?: string;
  sourceUrl?: string;
  /** Base payback rates per setting [s1, s2, s3, s4, s5, s6] */
  paybackRates: [number, number, number, number, number, number];
  /** Machine-specific additional input fields */
  extraFields: MachineInputField[];
  /** Theoretical BB probability per setting */
  bbProbability?: [number, number, number, number, number, number];
  /** Theoretical RB probability per setting */
  rbProbability?: [number, number, number, number, number, number];
  /** Max game count to reach bonus/AT ceiling */
  ceilingGames?: number;
  /** At probability per setting */
  atProbability?: [number, number, number, number, number, number];
  favorite?: boolean;
};

// ─── Input State ──────────────────────────────────────────────────────────────
export type CommonInputs = {
  totalGames: string;
  currentGames: string;
  bbCount: string;
  rbCount: string;
  remainingHours: string;
  remainingMinutes: string;
};

export type ExtraInputs = Record<string, string>;

// ─── Calculation Result ───────────────────────────────────────────────────────
export type CalculationResult = {
  machineId: string;
  machineName: string;
  timestamp: number;
  calculationModel: string;
  inputs: CommonInputs;
  extraInputs: ExtraInputs;
  expectedValue: number;
  expectedValuePerHour: number;
  estimatedSetting: number;
  settingDistribution: SettingDistribution;
  estimatedPayback: number;
  highSettingProbability: number; // setting >= 4
  veryHighSettingProbability: number; // setting >= 5
  /** Detailed fields for non-A-type machines */
  remainingToBonus?: number;
  remainingToCeiling?: number;
  stateExpectedValues?: StateExpectedValue[];
};

export type SettingDistribution = {
  s1: number; s2: number; s3: number;
  s4: number; s5: number; s6: number;
};

export type StateExpectedValue = {
  label: string;
  value: number;
};

// ─── Session / History ────────────────────────────────────────────────────────
export type HistoryEntry = CalculationResult & {
  id: string;
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export type AppSettings = {
  medalRate: number;          // 貸しメダル (e.g. 20円 or 4円)
  exchangeRate: number;       // 交換率（100円あたりの交換枚数。5.5枚交換なら5.5）
  useCashMedals: boolean;     // 持ちメダル優先
  gamesPerHour: number;       // 1時間あたり消化ゲーム数
  estimatedLossMinutes: number; // 見込みロス時間（分）
  defaultRemainingHours: number; // 残り時間 初期値
  priorDistribution: 'uniform' | 'realistic' | 'optimistic'; // 事前分布
};

export const DEFAULT_SETTINGS: AppSettings = {
  medalRate: 20,
  exchangeRate: 5.5,
  useCashMedals: true,
  gamesPerHour: 350,
  estimatedLossMinutes: 30,
  defaultRemainingHours: 3,
  priorDistribution: 'realistic',
};
