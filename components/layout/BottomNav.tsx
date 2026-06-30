'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Calculator, LayoutGrid, Settings } from 'lucide-react';

const TABS = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/history', label: '計算履歴', icon: Clock },
  { href: '/calculation', label: '計算する', icon: Calculator, primary: true },
  { href: '/machines', label: '機種一覧', icon: LayoutGrid },
  { href: '/settings', label: '設定・情報', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Map result page to calculation tab for nav highlighting
  const activePathname = pathname === '/result' ? '/calculation' : pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(to top, #020413, rgba(2,4,19,0.94))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="メインナビゲーション"
    >
      <div className="mx-auto max-w-[960px] px-2 pt-2">
        <div className="retro-frame retro-frame-compact">
          <div className="flex items-end justify-around h-16 px-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePathname === tab.href;

              if (tab.primary) {
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className="flex flex-col items-center justify-end pb-2 -mt-5 flex-1"
                    aria-label={tab.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div
                      className="w-14 h-14 flex items-center justify-center transition-transform active:scale-95"
                      style={{
                        background: isActive ? '#f8fbff' : '#061b82',
                        border: '2px solid #f8fbff',
                        boxShadow: 'inset 0 0 0 2px #aab4cd, 2px 2px 0 #020729',
                      }}
                    >
                      <Icon size={24} color={isActive ? '#031052' : '#f8fbff'} strokeWidth={2.5} />
                    </div>
                    <span className="retro-label mt-1 text-[9px]">{tab.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-opacity active:opacity-70"
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={22}
                    color={isActive ? '#f8fbff' : '#9fb0dd'}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span
                    className="retro-label text-[10px] transition-colors"
                    style={{ color: isActive ? '#f8fbff' : '#9fb0dd' }}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
