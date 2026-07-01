// ─── Machine Types ────────────────────────────────────────────────────────────
export type MachineCategory = 'ミドル' | 'ライトミドル' | '甘デジ' | 'LT機' | '海物語';

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
  sourceLabel?: string;
  referenceUrl?: string;
  /** 1000円あたりの目安ボーダー回転数 */
  borderRate: number;
  /** 大当り確率などの表示用情報 */
  probability: string;
  /** 初当り確率分母。未設定時は probability 表示から抽出する */
  initialProbability?: number;
  /** 期待値計算に使う通常時の実効初当り確率分母。チャージ合算などはこちらに入れる */
  calculationProbability?: number;
  rushRate?: string;
  /** 初当り1回あたりの実質平均出玉（玉）。参照元の掲載値またはフォールバック値 */
  expectedOutput?: number;
  /** expectedOutput と同じ値を明示するための表示用フィールド */
  initialAverageOutput?: number;
  /** 大当り1回の出玉候補。複合出玉や上乗せは hitOutput / outputNotes も確認する */
  jackpotOutputValues?: number[];
  /** RUSH中大当り1回あたりの出玉。参照元から取れた場合のみ設定 */
  rushAverageOutput?: number;
  /** LT突入時点で明示されている出玉。参照元から取れた場合のみ設定 */
  ltEntryOutput?: number;
  rounds?: string;
  prizeBalls?: string;
  supportGames?: string;
  hitOutput?: string;
  introductionDate?: string;
  specNotes?: string[];
  outputNotes?: string[];
  extraFields: MachineInputField[];
  favorite?: boolean;
};

// ─── Input State ──────────────────────────────────────────────────────────────
export type CommonInputs = {
  totalGames: string;      // 総通常回転数
  currentGames: string;    // 現在の回転数
  spinsPer1000Yen: string; // 1000円あたり回転数
  bbCount: string;         // 大当り回数
  rbCount: string;         // 初当り回数
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
  estimatedSetting: number; // 回転率評価 1-6
  settingDistribution: SettingDistribution;
  estimatedPayback: number; // ボーダー比率
  highSettingProbability: number; // プラス期待度
  veryHighSettingProbability: number; // 強プラス期待度
  borderRate: number;
  actualSpinRate: number; // 1000円あたり回転数
  borderGap: number;
  initialProbability: number;
  expectedOutput: number;
  expectedBallsPerStart: number;
  projectedStarts: number;
  stateExpectedValues?: StateExpectedValue[];
};

export type SettingDistribution = {
  s1: number; s2: number; s3: number;
  s4: number; s5: number; s6: number;
};

export type StateExpectedValue = {
  label: string;
  value: number;
  unit?: string;
};

// ─── Session / History ────────────────────────────────────────────────────────
export type HistoryEntry = CalculationResult & {
  id: string;
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export type AppSettings = {
  ballRate: number;          // 貸し玉単価（円/玉）
  exchangeRate: number;      // 交換率（100円あたりの交換玉数。28玉交換なら28）
  useCashBalls: boolean;     // 持ち玉優先
  startsPerHour: number;     // 1時間あたり通常回転数
  estimatedLossMinutes: number; // 見込みロス時間（分）
  defaultRemainingHours: number; // 残り時間 初期値
  priorDistribution: 'uniform' | 'realistic' | 'optimistic'; // 仮評価の事前分布
};

export const DEFAULT_SETTINGS: AppSettings = {
  ballRate: 4,
  exchangeRate: 28,
  useCashBalls: true,
  startsPerHour: 240,
  estimatedLossMinutes: 30,
  defaultRemainingHours: 3,
  priorDistribution: 'realistic',
};
