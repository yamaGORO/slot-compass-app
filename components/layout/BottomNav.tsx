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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8"
      style={{
        background: 'linear-gradient(to top, #000000, #0d0d0d)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="メインナビゲーション"
    >
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
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #e8c64a 0%, #c9962a 50%, #b8860b 100%)'
                      : 'linear-gradient(135deg, #c9962a 0%, #9a6f08 100%)',
                    boxShadow: '0 0 20px rgba(201,150,42,0.4)',
                  }}
                >
                  <Icon size={24} color="#080808" strokeWidth={2.5} />
                </div>
                <span className="text-[9px] mt-1 font-medium text-[#c9962a]">{tab.label}</span>
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
                color={isActive ? '#c9962a' : '#666666'}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? '#c9962a' : '#666666' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
