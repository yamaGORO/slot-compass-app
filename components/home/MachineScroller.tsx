'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFeaturedMachines } from '@/data/machines';
import MachineCard from '@/components/ui/MachineCard';
import { setRecentMachineId } from '@/lib/store';

export default function MachineScroller() {
  const router = useRouter();
  const machines = getFeaturedMachines();

  const handleSelect = (id: string) => {
    setRecentMachineId(id);
    router.push(`/calculation?machine=${id}`);
  };

  return (
    <section className="py-3">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-sm font-semibold text-white/90">機種を選択</h2>
        <Link
          href="/machines"
          className="text-[11px] font-medium text-[#c9962a] flex items-center gap-1"
        >
          すべて見る
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-3">
        <Link
          href="/machines"
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-white/30"
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          機種名で検索
        </Link>
      </div>

      {/* Horizontal machine scroll */}
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
        {machines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            size="md"
            onClick={() => handleSelect(machine.id)}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="flex justify-center mt-3">
        <div
          className="w-10 h-0.5 rounded-full"
          style={{ background: 'rgba(201,150,42,0.4)' }}
        />
      </div>
    </section>
  );
}
