'use client';

import Link from 'next/link';
import { RetroMetric, RetroPage, RetroPanel } from '@/components/ui/Retro';
import { MACHINES as SLOT_MACHINES } from '@/data/machines';
import { MACHINES as PACHINKO_MACHINES } from '@/data/pachinko/machines';

export default function AppSelectorPage() {
  return (
    <RetroPage
      brandTitle="COMPASS"
      systemLabel="REPORT SELECT SYSTEM"
      reportTitle="選択画面"
      message="使用する報告書システムを選択してください。選択後は、それぞれの入力画面・履歴・設定を別々に使用できます。"
    >
      <RetroPanel title="COMPASS SELECT">
        <div className="grid gap-3 md:grid-cols-2">
          <Link href="/slot" className="retro-frame retro-frame-compact block transition-transform active:translate-x-0.5 active:translate-y-0.5">
            <div className="retro-panel-body px-4 py-5 text-center">
              <p className="retro-title text-xl sm:text-2xl">SLOT COMPASS</p>
              <p className="retro-value mt-4 text-3xl text-[#ffe17b]">スロット</p>
              <p className="retro-label mt-4 leading-relaxed">
                BB/RB、回転数、機種別項目から期待値と予想設定を表示します。
              </p>
            </div>
          </Link>

          <Link href="/pachinko" className="retro-frame retro-frame-compact block transition-transform active:translate-x-0.5 active:translate-y-0.5">
            <div className="retro-panel-body px-4 py-5 text-center">
              <p className="retro-title text-xl sm:text-2xl">PACHINKO COMPASS</p>
              <p className="retro-value mt-4 text-3xl text-[#ffe17b]">パチンコ</p>
              <p className="retro-label mt-4 leading-relaxed">
                1000円あたり回転数、初当り平均出玉、交換率から期待値を表示します。
              </p>
            </div>
          </Link>
        </div>
      </RetroPanel>

      <RetroPanel title="登録情報">
        <div className="retro-box-grid">
          <RetroMetric label="スロット機種" value={`${SLOT_MACHINES.length}`} unit="機種" />
          <RetroMetric label="パチンコ機種" value={`${PACHINKO_MACHINES.length}`} unit="機種" />
          <RetroMetric label="履歴" value="個別保存" />
          <RetroMetric label="PWA" value="READY" />
        </div>
      </RetroPanel>
    </RetroPage>
  );
}
