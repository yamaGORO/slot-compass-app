'use client';

/**
 * Lightweight client-side store using localStorage.
 * Replace with a server-side store (Neon/Supabase) when ready.
 */

import type { AppSettings, HistoryEntry, CalculationResult } from '@/types/pachinko';
import { DEFAULT_SETTINGS } from '@/types/pachinko';

const SETTINGS_KEY = 'pachinko-compass:settings';
const HISTORY_KEY = 'pachinko-compass:history';
const RECENT_MACHINE_KEY = 'pachinko-compass:recent-machine';
const CURRENT_RESULT_KEY = 'pachinko-compass:current-result';

// ── Settings ──────────────────────────────────────────────────────────────────
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ── History ───────────────────────────────────────────────────────────────────
export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addToHistory(result: CalculationResult): void {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  const entry: HistoryEntry = { ...result, id: crypto.randomUUID() };
  history.unshift(entry);
  const trimmed = history.slice(0, 100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

// ── Recent machine ─────────────────────────────────────────────────────────────
export function getRecentMachineId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(RECENT_MACHINE_KEY);
}

export function setRecentMachineId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RECENT_MACHINE_KEY, id);
}

// ── Current result (passed between calculation → result pages) ─────────────────
export function saveCurrentResult(result: CalculationResult): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_RESULT_KEY, JSON.stringify(result));
}

export function getCurrentResult(): CalculationResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
