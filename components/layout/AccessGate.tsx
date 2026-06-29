'use client';

import { useEffect, useState } from 'react';
import CompassLogo from '@/components/ui/CompassLogo';

const ACCESS_KEY = 'slot-compass:access-ok';
const ACCESS_CODE_HASH = '9631d027f0f564ae30e6fe345fea89282b81f2150375f52796be0b72074cd49b';

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setUnlocked(localStorage.getItem(ACCESS_KEY) === 'true');
    setMounted(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChecking(true);
    setError('');

    try {
      const hash = await sha256(code);
      if (hash === ACCESS_CODE_HASH) {
        localStorage.setItem(ACCESS_KEY, 'true');
        setUnlocked(true);
        return;
      }
      setError('パスコードが違います');
    } finally {
      setChecking(false);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#080808]" />;
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#080808' }}>
      <div
        className="w-full rounded-2xl p-6"
        style={{
          background: 'linear-gradient(150deg, #131313 0%, #0d0d0d 100%)',
          border: '1px solid rgba(201,150,42,0.22)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        }}
      >
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <CompassLogo size={56} />
          <div>
            <p className="text-base font-bold text-white tracking-widest" style={{ fontFamily: 'serif' }}>
              SLOT COMPASS
            </p>
            <p className="text-[10px] text-[#c9962a] tracking-widest mt-1">PRIVATE ACCESS</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-white/50">パスコード</span>
            <input
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              className="mt-2 w-full h-12 rounded-xl px-4 text-base font-semibold text-white outline-none"
              style={{
                background: '#1a1a1a',
                border: `1px solid ${error ? 'rgba(224,82,82,0.45)' : 'rgba(255,255,255,0.1)'}`,
              }}
              aria-label="パスコード"
            />
          </label>

          {error && <p className="text-xs text-[#e05252]">{error}</p>}

          <button
            type="submit"
            disabled={!code || checking}
            className="w-full h-12 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
            style={{
              background: 'linear-gradient(90deg, #b8860b, #c9962a)',
              color: '#080808',
              boxShadow: '0 4px 20px rgba(201,150,42,0.28)',
            }}
          >
            {checking ? '確認中...' : '開く'}
          </button>
        </form>
      </div>
    </div>
  );
}
