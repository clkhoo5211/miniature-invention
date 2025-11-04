/**
 * Pool Statistics Service
 * Provides pool statistics with structure ready for on-chain/backend integration
 */

export interface PoolStats {
  asset: string;
  denomination: string;
  network: string;
  totalDeposits: number; // Total number of deposits
  totalVolume: string; // Total volume (e.g., "1250.5 ETH")
  anonymitySet: number; // Current anonymity set size
  lastDepositTime: string | null; // ISO timestamp
  lastDepositHash: string | null; // Transaction hash
  averageDepositInterval: number | null; // Minutes between deposits
  depositsLast24h: number;
  depositsLast7d: number;
}

export interface DepositEvent {
  hash: string;
  timestamp: string;
  amount: string;
  asset: string;
  network: string;
}

/**
 * Get pool statistics (MVP: local data, future: on-chain/indexer)
 */
export async function getPoolStats(
  asset: string,
  denomination: string,
  network: string
): Promise<PoolStats> {
  // TODO: Replace with on-chain event queries or indexer API
  // For now, combine local history with mock enhanced data
  
  try {
    const { listTxHistory } = await import('./note');
    const history = listTxHistory();
    
    const poolDeposits = history.filter(
      (tx) =>
        tx.type === 'deposit' &&
        tx.asset === asset &&
        tx.amount === denomination &&
        tx.network === network
    );

    const totalDeposits = poolDeposits.length;
    const totalVolume = (parseFloat(denomination) * totalDeposits).toFixed(2);
    
    // Calculate last deposit
    const sorted = poolDeposits
      .map((tx) => ({ ...tx, ts: new Date(tx.timestamp).getTime() }))
      .sort((a, b) => b.ts - a.ts);
    
    const lastDeposit = sorted[0];
    const lastDepositTime = lastDeposit?.timestamp || null;
    const lastDepositHash = lastDeposit?.hash || null;

    // Calculate deposits in last 24h and 7d
    const now = Date.now();
    const day24h = 24 * 60 * 60 * 1000;
    const day7d = 7 * day24h;
    
    const depositsLast24h = sorted.filter(
      (tx) => now - tx.ts < day24h
    ).length;
    
    const depositsLast7d = sorted.filter(
      (tx) => now - tx.ts < day7d
    ).length;

    // Calculate average interval (if 2+ deposits)
    let averageDepositInterval: number | null = null;
    if (sorted.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < sorted.length; i++) {
        intervals.push((sorted[i - 1].ts - sorted[i].ts) / (1000 * 60)); // minutes
      }
      averageDepositInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    // Get anonymity set from local notes
    const { getAnonymitySetCount } = await import('./note');
    const anonymitySet = getAnonymitySetCount(asset, denomination);

    return {
      asset,
      denomination,
      network,
      totalDeposits,
      totalVolume: `${totalVolume} ${asset}`,
      anonymitySet,
      lastDepositTime,
      lastDepositHash,
      averageDepositInterval: averageDepositInterval
        ? Math.round(averageDepositInterval)
        : null,
      depositsLast24h,
      depositsLast7d,
    };
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    // Return defaults on error
    return {
      asset,
      denomination,
      network,
      totalDeposits: 0,
      totalVolume: '0',
      anonymitySet: 0,
      lastDepositTime: null,
      lastDepositHash: null,
      averageDepositInterval: null,
      depositsLast24h: 0,
      depositsLast7d: 0,
    };
  }
}

/**
 * Get recent deposit events for a pool
 */
export async function getRecentDeposits(
  asset: string,
  denomination: string,
  network: string,
  limit = 10
): Promise<DepositEvent[]> {
  try {
    const { listTxHistory } = await import('./note');
    const history = listTxHistory();
    
    const poolDeposits = history
      .filter(
        (tx) =>
          tx.type === 'deposit' &&
          tx.asset === asset &&
          tx.amount === denomination &&
          tx.network === network &&
          tx.hash
      )
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit)
      .map((tx) => ({
        hash: tx.hash!,
        timestamp: tx.timestamp,
        amount: tx.amount,
        asset: tx.asset,
        network: tx.network,
      }));

    return poolDeposits;
  } catch (error) {
    console.error('Error fetching recent deposits:', error);
    return [];
  }
}

/**
 * Future: On-chain integration example
 * 
 * export async function getPoolStatsFromChain(
 *   asset: string,
 *   denomination: string,
 *   network: string,
 *   contractAddress: string
 * ): Promise<PoolStats> {
 *   // Query contract events:
 *   // - Deposit events
 *   // - Withdraw events
 *   // - Calculate anonymity set from merkle tree
 *   // - Aggregate volumes and intervals
 *   
 *   // Or use an indexer API:
 *   // const response = await fetch(
 *   //   `https://indexer.example.com/pools/${network}/${asset}/${denomination}/stats`
 *   // );
 *   // return response.json();
 * }
 */

