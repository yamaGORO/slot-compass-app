'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MACHINES } from '@/data/machines';
import { RetroDataRow, RetroInput, RetroMetric, RetroPage, RetroPanel } from '@/components/ui/Retro';
import type { Machine } from '@/types';

function MachineRow({ machine, onSelect }: { machine: Machine; onSelect: () => void }) {
  const minRate = Math.min(...machine.paybackRates);
  const maxRate = Math.max(...machine.paybackRates);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="retro-row w-full py-3 text-left"
      aria-label={`${machine.name}を選択`}
    >
      <div className="min-w-0">
        <p className="retro-value truncate text-sm">{machine.name}</p>
        <p className="retro-label mt-1 truncate">
          {machine.maker} / {machine.category}{machine.subCategory ? ` / ${machine.subCategory}` : ''}
        </p>
      </div>
      <div className="text-right">
        <p className="retro-label">機械割</p>
        <p className="retro-value text-xs">
          {minRate.toFixed(1)}-{maxRate.toFixed(1)}%
        </p>
      </div>
    </button>
  );
}

export default function MachinesPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return MACHINES.filter((machine) => {
      const normalizedQuery = query.toLowerCase();
      return (
        normalizedQuery === '' ||
        machine.name.toLowerCase().includes(normalizedQuery) ||
        machine.maker.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  return (
    <RetroPage
      reportTitle="機種一覧"
      commands={[
        { href: '/calculation', label: '入力' },
        { href: '/settings', label: '設定' },
      ]}
      message="Excel正本の20機種を1つのリストにまとめています。機種を選ぶと入力報告書へ移動します。"
    >
      <RetroPanel title="検索">
        <RetroDataRow label="機種名・メーカー">
          <RetroInput value={query} onChange={setQuery} ariaLabel="機種名・メーカーで検索" placeholder="SEARCH" />
        </RetroDataRow>
        <div className="retro-box-grid mt-4">
          <RetroMetric label="登録機種" value={`${MACHINES.length}`} unit="機種" />
          <RetroMetric label="表示件数" value={`${filtered.length}`} unit="件" />
          <RetroMetric label="Aタイプ" value={`${MACHINES.filter((m) => m.category === 'Aタイプ').length}`} unit="機種" />
          <RetroMetric label="スマスロ" value={`${MACHINES.filter((m) => m.category === 'スマスロ').length}`} unit="機種" />
        </div>
      </RetroPanel>

      <RetroPanel title="機種リスト">
        {filtered.length > 0 ? (
          filtered.map((machine) => (
            <MachineRow
              key={machine.id}
              machine={machine}
              onSelect={() => router.push(`/calculation?machine=${machine.id}`)}
            />
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="retro-value">NO DATA</p>
            <p className="retro-label mt-2">該当する機種が見つかりません。</p>
          </div>
        )}
      </RetroPanel>
    </RetroPage>
  );
}
