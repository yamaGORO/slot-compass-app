'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';
import { MACHINES } from '@/data/machines';
import type { Machine } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  'Aタイプ': '#3a7bd5',
  'スマスロ': '#c9962a',
  'AT機': '#b05bb5',
  'ART機': '#5bb55e',
};

function MachinePlaceholderThumb({ machine }: { machine: Machine }) {
  const color = CATEGORY_COLORS[machine.category] ?? '#c9962a';
  return (
    <div
      className="w-14 h-14 rounded-xl flex-shrink-0 flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(135deg, #1a1608, #0d0d0d)`,
        border: `1px solid ${color}33`,
      }}
      aria-hidden="true"
    >
      <span className="text-lg font-bold" style={{ color, fontFamily: 'serif' }}>
        {machine.name.slice(0, 2)}
      </span>
    </div>
  );
}

function MachineRow({ machine, onSelect }: { machine: Machine; onSelect: () => void }) {
  const color = CATEGORY_COLORS[machine.category] ?? '#c9962a';
  const minRate = Math.min(...machine.paybackRates);
  const maxRate = Math.max(...machine.paybackRates);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-4 px-4 py-3.5 transition-all active:scale-[0.99]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      aria-label={`${machine.name}を選択`}
    >
      <MachinePlaceholderThumb machine={machine} />

      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold text-white leading-tight truncate">{machine.name}</p>
        <p className="text-[11px] text-white/40 mt-0.5 truncate">{machine.maker}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              background: `${color}18`,
              color,
              border: `1px solid ${color}33`,
            }}
          >
            {machine.category}
          </span>
          {machine.subCategory && (
            <span className="text-[9px] text-white/30">{machine.subCategory}</span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-[10px] text-white/30 mb-0.5">機械割</p>
        <p className="text-xs font-bold text-white/70">
          {minRate.toFixed(1)}
          <span className="text-white/30">〜</span>
          {maxRate.toFixed(1)}%
        </p>
        <ChevronRight size={14} color="rgba(255,255,255,0.2)" className="ml-auto mt-1" />
      </div>
    </button>
  );
}

export default function MachinesPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return MACHINES.filter((m) => {
      const matchesQuery =
        query === '' ||
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.maker.toLowerCase().includes(query.toLowerCase());
      return matchesQuery;
    });
  }, [query]);

  const handleSelect = (machine: Machine) => {
    router.push(`/calculation?machine=${machine.id}`);
  };

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 pt-5 pb-3 space-y-3"
        style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-white">機種一覧</h1>
          <span className="text-xs text-white/30">{filtered.length}機種</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="機種名・メーカーで検索"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white/80 placeholder:text-white/25 outline-none"
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>
      </div>

      {/* List */}
      <div>
        {filtered.length > 0 ? (
          filtered.map((machine) => (
            <MachineRow
              key={machine.id}
              machine={machine}
              onSelect={() => handleSelect(machine)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Search size={32} color="rgba(255,255,255,0.15)" />
            <p className="text-sm text-white/30">該当する機種が見つかりません</p>
          </div>
        )}
      </div>
    </div>
  );
}
