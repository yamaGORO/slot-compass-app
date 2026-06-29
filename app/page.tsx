'use client';

import { useEffect, useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import ExpectedValueCard from '@/components/home/ExpectedValueCard';
import MachineScroller from '@/components/home/MachineScroller';
import ExpectedValueChart from '@/components/home/ExpectedValueChart';
import { getCurrentResult } from '@/lib/store';
import type { CalculationResult } from '@/types';

export default function HomePage() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(getCurrentResult());
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <HeroSection />
      {/* Pass null before mount to avoid localStorage hydration mismatch */}
      <ExpectedValueCard result={mounted ? result : null} />
      <div className="mx-4" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
      <MachineScroller />
      <div className="mx-4" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
      <ExpectedValueChart result={mounted ? result : null} />
      <div className="h-6" />
    </div>
  );
}
