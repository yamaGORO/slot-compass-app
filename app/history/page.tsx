'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ChevronRight } from 'lucide-react';
import { getHistory, clearHistory, saveCurrentResult } from '@/lib/store';
import type { HistoryEntry } from '@/types';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const mo = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${mo}/${day} ${h}:${m}`;
}

function HistoryRow({ entry, onView }: { entry: HistoryEntry; onView: () => void }) {
  const isPositive = entry.expectedValue >= 0;
  return (
    <button
      type="button"
      onClick={onView}
      className="w-full flex items-center gap-4 px-4 py-4 transition-all active:bg-white/[0.03]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      aria-label={`${entry.machineName}の結果を表示`}
    >
      {/* EV pill */}
      <div
        className="w-20 flex-shrink-0 flex flex-col items-center justify-center py-2 rounded-xl"
        style={{
          background: isPositive ? 'rgba(201,150,42,0.12)' : 'rgba(224,82,82,0.12)',
          border: `1px solid ${isPositive ? 'rgba(201,150,42,0.25)' : 'rgba(224,82,82,0.25)'}`,
        }}
      >
        <span className="text-[9px] font-medium mb-0.5" style={{ color: isPositive ? '#c9962a' : '#e05252' }}>
          期待値
        </span>
        <span
          className="text-sm font-bold leading-tight"
          style={{ color: isPositive ? '#c9962a' : '#e05252', fontFeatureSettings: '"tnum"' }}
        >
          {isPositive ? '+' : ''}
          {Math.abs(entry.expectedValue) >= 1000
            ? `${(entry.expectedValue / 1000).toFixed(1)}k`
            : entry.expectedValue.toFixed(0)
          }
        </span>
        <span className="text-[9px]" style={{ color: isPositive ? '#c9962a' : '#e05252' }}>円</span>
      </div>

      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate leading-tight">{entry.machineName}</p>
        <p className="text-[11px] text-white/30 mt-0.5">{formatDate(entry.timestamp)}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-white/40">
            予想設定：
            <span className="font-semibold text-white/70">{entry.estimatedSetting.toFixed(1)}</span>
          </span>
          <span className="text-[10px] text-white/40">
            機械割：
            <span className="font-semibold text-white/70">{entry.estimatedPayback.toFixed(1)}%</span>
          </span>
        </div>
      </div>

      <ChevronRight size={16} color="rgba(255,255,255,0.2)" className="flex-shrink-0" />
    </button>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleView = (entry: HistoryEntry) => {
    // Restore to current result and navigate to result page
    const { id: _, ...result } = entry;
    saveCurrentResult(result);
    router.push('/result');
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
        style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <h1 className="text-base font-bold text-white">計算履歴</h1>
          <p className="text-[10px] text-white/30">{history.length}件</p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#e05252] transition-colors"
          >
            <Trash2 size={13} />
            全削除
          </button>
        )}
      </div>

      {/* List */}
      {history.length > 0 ? (
        history.map((entry) => (
          <HistoryRow key={entry.id} entry={entry} onView={() => handleView(entry)} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4 px-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/40">履歴がありません</p>
            <p className="text-xs text-white/20 mt-1.5 leading-relaxed">
              計算を実行すると結果がここに保存されます
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/calculation')}
            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(201,150,42,0.15)', color: '#c9962a', border: '1px solid rgba(201,150,42,0.25)' }}
          >
            計算画面へ
          </button>
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10 space-y-4"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white text-center">履歴を全削除しますか？</h3>
            <p className="text-sm text-white/40 text-center">この操作は取り消せません</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-12 rounded-xl text-sm font-semibold text-white/60"
                style={{ background: '#2a2a2a' }}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 h-12 rounded-xl text-sm font-bold"
                style={{ background: '#e05252', color: '#ffffff' }}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
