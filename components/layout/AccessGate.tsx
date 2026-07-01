'use client';

import { useEffect, useState } from 'react';
import { RetroButton, RetroDataRow, RetroInput, RetroMessage, RetroPanel } from '@/components/ui/Retro';

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
    return <div className="min-h-screen bg-[#020413]" />;
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="retro-screen min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[520px] space-y-3">
        <RetroPanel title="COMPASS / PRIVATE ACCESS">
          <form onSubmit={handleSubmit} className="space-y-4">
            <RetroDataRow label="パスコード" description="知人共有用のアクセスコード">
              <RetroInput
                value={code}
                onChange={setCode}
                type="password"
                ariaLabel="パスコード"
                placeholder="CODE"
              />
            </RetroDataRow>

            {error && <p className="text-xs font-bold text-[#ff8c8c] retro-text">{error}</p>}

            <RetroButton type="submit" disabled={!code || checking} className="w-full">
              {checking ? '確認中...' : '開く'}
            </RetroButton>
          </form>
        </RetroPanel>
        <RetroMessage>
          パスコードを入力すると、スロット版とパチンコ版を選択できます。
        </RetroMessage>
      </div>
    </div>
  );
}
