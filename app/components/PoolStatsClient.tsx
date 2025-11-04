'use client';

import { useMemo } from 'react';
import { getAnonymitySetCount } from '../lib/note';

export default function PoolStatsClient({ asset, denom }: { asset: string; denom: string }) {
  const count = useMemo(() => {
    try {
      return getAnonymitySetCount(asset, denom);
    } catch {
      return 0;
    }
  }, [asset, denom]);

  return (
    <div className="text-2xl font-semibold">{count}</div>
  );
}
