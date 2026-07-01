'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Calculator, LayoutGrid, Settings } from 'lucide-react';

const TAB_DEFS = [
  { path: '/', label: 'ホーム', icon: Home },
  { path: '/history', label: '計算履歴', icon: Clock },
  { path: '/calculation', label: '計算する', icon: Calculator, primary: true },
  { path: '/machines', label: '機種一覧', icon: LayoutGrid },
  { path: '/settings', label: '設定・情報', icon: Settings },
];

function normalizePathname(pathname: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const withoutBasePath =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || '/'
      : pathname;

  return withoutBasePath.length > 1 && withoutBasePath.endsWith('/')
    ? withoutBasePath.slice(0, -1)
    : withoutBasePath;
}

function isPathMatch(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.endsWith(href);
}

export default function BottomNav() {
  const pathname = usePathname();
  const normalizedPathname = normalizePathname(pathname);
  const isSelector = normalizedPathname === '/';

  if (isSelector) {
    return null;
  }

  const isPachinko = normalizedPathname.startsWith('/pachinko');
  const appPrefix = isPachinko ? '/pachinko' : '/slot';
  const pathInApp = normalizedPathname.startsWith(appPrefix)
    ? normalizedPathname.slice(appPrefix.length) || '/'
    : normalizedPathname;

  // Map result page to calculation tab for nav highlighting
  const activePathname = isPathMatch(pathInApp, '/result') ? '/calculation' : pathInApp;
  const requestCalculation = () => {
    const formId = isPachinko ? 'pachinko-compass-calculation-form' : 'slot-compass-calculation-form';
    const eventName = isPachinko ? 'pachinko-compass:calculate' : 'slot-compass:calculate';
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (form?.requestSubmit) {
      form.requestSubmit();
      return;
    }

    window.dispatchEvent(new CustomEvent(eventName));
  };
  const tabs = TAB_DEFS.map((tab) => ({
    ...tab,
    href: tab.path === '/' ? appPrefix : `${appPrefix}${tab.path}`,
  }));

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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = isPathMatch(activePathname, tab.path);

              if (tab.primary) {
                const primaryClassName =
                  'flex flex-col items-center justify-end pb-2 -mt-5 flex-1 appearance-none border-0 bg-transparent px-0 pt-0 text-inherit';
                const primaryContent = (
                  <>
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
                  </>
                );

                if (isPathMatch(pathInApp, '/calculation')) {
                  return (
                    <button
                      key={tab.href}
                      type="button"
                      onClick={requestCalculation}
                      className={primaryClassName}
                      aria-label={`${tab.label}して結果を表示`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {primaryContent}
                    </button>
                  );
                }

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={primaryClassName}
                    aria-label={tab.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {primaryContent}
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
