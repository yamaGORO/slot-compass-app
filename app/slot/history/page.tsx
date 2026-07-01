'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearHistory, getHistory, saveCurrentResult } from '@/lib/store';
import { RetroButton, RetroMetric, RetroPage, RetroPanel } from '@/components/ui/Retro';
import type { HistoryEntry } from '@/types';

function formatDate(ts: number): string {
  const date = new Date(ts);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hour}:${minute}`;
}

function formatEV(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
}

function HistoryRow({ entry, onView }: { entry: HistoryEntry; onView: () => void }) {
  return (
    <button
      type="button"
      onClick={onView}
      className="retro-row w-full py-3 text-left"
      aria-label={`${entry.machineName}の結果を表示`}
    >
      <div className="min-w-0">
        <p className="retro-value truncate text-sm">{entry.machineName}</p>
        <p className="retro-label mt-1">
          {formatDate(entry.timestamp)} / 設定 {entry.estimatedSetting.toFixed(1)} / 機械割 {entry.estimatedPayback.toFixed(1)}%
        </p>
      </div>
      <div className="text-right">
        <p className="retro-label">期待値</p>
        <p className={`retro-value text-xs ${entry.expectedValue < 0 ? 'text-[#ff8c8c]' : 'text-[#ffe17b]'}`}>
          {formatEV(entry.expectedValue)}
        </p>
      </div>
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
    const { id: _, ...result } = entry;
    saveCurrentResult(result);
    router.push('/slot/result');
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    setShowConfirm(false);
  };

  return (
    <RetroPage
      reportTitle="履歴"
      commands={[
        { href: '/slot/calculation', label: '入力' },
        { href: '/slot/settings', label: '設定' },
      ]}
      message={history.length > 0 ? '履歴を選択すると、保存済みの期待値報告書を再表示します。' : '計算を実行すると、期待値報告書の履歴がここに保存されます。'}
    >
      <RetroPanel title="計算履歴">
        <div className="retro-box-grid mb-4">
          <RetroMetric label="保存件数" value={`${history.length}`} unit="件" />
          <RetroMetric label="保存形式" value="端末内" />
          <RetroMetric label="最大保存" value="100" unit="件" />
          <RetroMetric label="状態" value={history.length > 0 ? 'LOG' : 'EMPTY'} />
        </div>

        {history.length > 0 ? (
          <>
            {history.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} onView={() => handleView(entry)} />
            ))}
            <div className="mt-4">
              <RetroButton onClick={() => setShowConfirm(true)} className="w-full">
                全削除
              </RetroButton>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="retro-value text-xl">NO REPORT</p>
            <p className="retro-label mt-3">保存済みの報告書はありません。</p>
            <div className="mt-5">
              <RetroButton onClick={() => router.push('/slot/calculation')}>入力画面へ</RetroButton>
            </div>
          </div>
        )}
      </RetroPanel>

      {showConfirm && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 px-3 pb-5"
          onClick={() => setShowConfirm(false)}
        >
          <div className="w-full max-w-[520px]" onClick={(event) => event.stopPropagation()}>
            <RetroPanel title="履歴削除確認">
              <p className="retro-label mb-4 text-center">この操作は取り消せません。</p>
              <div className="grid grid-cols-2 gap-2">
                <RetroButton onClick={() => setShowConfirm(false)}>戻る</RetroButton>
                <RetroButton onClick={handleClear}>削除する</RetroButton>
              </div>
            </RetroPanel>
          </div>
        </div>
      )}
    </RetroPage>
  );
}
