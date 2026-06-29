'use client';

import Link from 'next/link';
import CompassLogo from '@/components/ui/CompassLogo';
import { Target, BarChart2, Shield, ChevronRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    title: '高精度な設定推測',
    desc: '大量の実戦データに基づく独自のアルゴリズム',
  },
  {
    icon: BarChart2,
    title: '期待値を可視化',
    desc: 'グラフで推移を確認 一目で分かる収支状況',
  },
  {
    icon: Shield,
    title: '完全無料・広告なし',
    desc: '登録不要ですぐに使えるプライバシーも安心',
  },
];

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0d0d0d 0%, #080808 60%, #0a0800 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <CompassLogo size={44} />
          <div>
            <h1 className="text-base font-bold tracking-widest text-white" style={{ fontFamily: 'serif' }}>
              SLOT COMPASS
            </h1>
            <p className="text-[9px] tracking-[0.2em] text-[#c9962a] font-medium">
              EXPECT VALUE NAVIGATION
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/history" className="flex flex-col items-center gap-0.5 opacity-70 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="text-[9px] text-white/60">履歴</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 opacity-70 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <span className="text-[9px] text-white/60">設定</span>
          </Link>
        </div>
      </div>

      {/* Hero content */}
      <div className="relative px-5 pt-4 pb-2 flex justify-between items-start">
        <div className="flex-1 pr-2">
          <h2 className="text-2xl font-bold leading-tight text-white text-balance mb-2">
            データで、<br />
            <span style={{ color: '#c9962a' }}>期待値</span>をナビゲートする。
          </h2>
          <p className="text-xs text-white/50 leading-relaxed text-pretty">
            回転数やボーナス回数を入力するだけで、<br />
            現在の期待値と設定推測を高精度で算出。
          </p>
        </div>
        {/* Decorative compass */}
        <div className="flex-shrink-0 opacity-60">
          <CompassLogo size={88} />
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex gap-3 px-5 pt-3 pb-3 overflow-x-auto scrollbar-hide">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="flex-shrink-0 flex flex-col gap-1.5 w-28"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(201,150,42,0.15)', border: '1px solid rgba(201,150,42,0.3)' }}
              >
                <Icon size={16} color="#c9962a" />
              </div>
              <p className="text-[10px] font-semibold text-white/80 leading-tight">{f.title}</p>
              <p className="text-[9px] text-white/40 leading-tight">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* CTA link */}
      <div className="px-5 pb-3">
        <Link
          href="/calculation"
          className="flex items-center gap-2 text-[11px] font-semibold tracking-widest"
          style={{ color: '#c9962a' }}
        >
          <ChevronRight size={14} />
          SCAN YOUR DATA
        </Link>
      </div>
    </section>
  );
}
