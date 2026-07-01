'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MACHINES } from '@/data/machines';
import { getCurrentResult } from '@/lib/store';
import { RetroButton, RetroMetric, RetroPage, RetroPanel } from '@/components/ui/Retro';
import type { CalculationResult } from '@/types';

function formatEV(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
}

export default function HomePage() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(getCurrentResult());
  }, []);

  const currentResult = mounted ? result : null;

  return (
    <RetroPage
      reportTitle="起動画面"
      commands={[
        { href: '/slot/history', label: '履歴' },
        { href: '/slot/settings', label: '設定' },
      ]}
      message={currentResult ? '直近の報告書を確認できます。新しい実戦データは入力画面から作成してください。' : '機種を選択して実戦データを入力すると、期待値報告書を作成できます。'}
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_0.85fr]">
        <RetroPanel title="SLOT COMPASS">
          <div className="text-center py-4">
            <p className="retro-value text-3xl sm:text-5xl">期待値報告書</p>
            <p className="retro-label mt-4 leading-relaxed">
              実戦データを入力し、期待値（円）と予想設定を中心に整理します。
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/slot/calculation" className="retro-command text-center">入力開始</Link>
            <Link href="/slot/machines" className="retro-command text-center">機種一覧</Link>
          </div>
        </RetroPanel>

        <RetroPanel title="登録情報">
          <div className="retro-box-grid lg:grid-cols-2">
            <RetroMetric label="登録機種" value={`${MACHINES.length}`} unit="機種" />
            <RetroMetric label="Aタイプ" value={`${MACHINES.filter((m) => m.category === 'Aタイプ').length}`} unit="機種" />
            <RetroMetric label="スマスロ" value={`${MACHINES.filter((m) => m.category === 'スマスロ').length}`} unit="機種" />
            <RetroMetric label="PWA" value="READY" />
          </div>
        </RetroPanel>
      </div>

      <RetroPanel title="直近の期待値報告書">
        {currentResult ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="text-center">
              <p className="retro-label mb-3">{currentResult.machineName}</p>
              <p className={`retro-big-number ${currentResult.expectedValue < 0 ? 'text-[#ff8c8c]' : 'text-[#ffe17b]'}`}>
                {formatEV(currentResult.expectedValue)}
              </p>
              <p className="retro-value mt-2 text-lg">円</p>
            </div>
            <div className="retro-box-grid lg:grid-cols-2">
              <RetroMetric label="予想設定" value={currentResult.estimatedSetting.toFixed(1)} />
              <RetroMetric label="機械割" value={currentResult.estimatedPayback.toFixed(1)} unit="%" />
              <RetroMetric label="設定4以上" value={`${Math.round(currentResult.highSettingProbability * 100)}`} unit="%" />
              <RetroMetric label="設定5以上" value={`${Math.round(currentResult.veryHighSettingProbability * 100)}`} unit="%" />
            </div>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="retro-value text-xl">NO REPORT</p>
            <p className="retro-label mt-3">まだ報告書は作成されていません。</p>
          </div>
        )}
      </RetroPanel>

      <RetroPanel title="運用メモ">
        <div className="retro-box-grid">
          <RetroMetric label="機種選択" value="単一" />
          <RetroMetric label="入力初期値" value="空欄" />
          <RetroMetric label="判断文" value="なし" />
          <RetroMetric label="計算部" value="分離済" />
        </div>
      </RetroPanel>
    </RetroPage>
  );
}
