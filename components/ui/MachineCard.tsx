'use client';

import type { Machine } from '@/types';

interface MachineCardProps {
  machine: Machine;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Aタイプ': '#3a7bd5',
  'スマスロ': '#c9962a',
  'AT機': '#b05bb5',
  'ART機': '#5bb55e',
};

// Deterministic hue based on machine id
function machineHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

// Placeholder art using machine initials + styled background
function MachinePlaceholderArt({ machine }: { machine: Machine }) {
  const color = CATEGORY_COLORS[machine.category] ?? '#c9962a';
  const hue = machineHue(machine.id);
  // Show first 2 chars of name
  const line1 = machine.name.slice(0, 2);
  const line2 = machine.name.slice(2, 4);
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center select-none relative overflow-hidden"
      style={{
        background: `linear-gradient(150deg, hsl(${hue},30%,10%) 0%, #080808 100%)`,
      }}
      aria-hidden="true"
    >
      {/* Decorative radial glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${color} 0%, transparent 65%)`,
        }}
      />
      <span
        className="relative text-lg font-bold leading-tight"
        style={{ color, fontFamily: 'serif', textShadow: `0 0 10px ${color}66` }}
      >
        {line1}
      </span>
      {line2 && (
        <span
          className="relative text-lg font-bold leading-tight"
          style={{ color, fontFamily: 'serif', textShadow: `0 0 10px ${color}66` }}
        >
          {line2}
        </span>
      )}
      <div
        className="relative w-10 h-px mt-2 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </div>
  );
}

export default function MachineCard({
  machine,
  size = 'md',
  onClick,
  selected = false,
}: MachineCardProps) {
  const color = CATEGORY_COLORS[machine.category] ?? '#c9962a';

  const sizeClasses = {
    sm: 'w-18 h-18',
    md: 'w-[80px] h-[80px]',
    lg: 'w-full h-32',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 transition-all active:scale-95"
      aria-label={machine.name}
      aria-pressed={selected}
    >
      <div
        className={`${sizeClasses[size]} rounded-xl overflow-hidden relative flex-shrink-0`}
        style={{
          outline: selected ? `2px solid ${color}` : '2px solid transparent',
          outlineOffset: '2px',
        }}
      >
        <MachinePlaceholderArt machine={machine} />
        {/* Category badge */}
        <div
          className="absolute bottom-0 left-0 right-0 flex gap-1 p-1 justify-center"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
        >
          <span
            className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
          >
            {machine.category}
          </span>
          {machine.subCategory && (
            <span className="text-[8px] font-medium text-white/50">
              {machine.subCategory}
            </span>
          )}
        </div>
      </div>
      <span className="text-[9px] text-white/75 text-center leading-tight w-[80px] line-clamp-2 break-keep">
        {machine.name}
      </span>
    </button>
  );
}
