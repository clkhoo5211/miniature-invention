import Link from 'next/link';
import dynamic from 'next/dynamic';

const PoolStatsClient = dynamic(() => import('../../../components/PoolStatsClient'), { ssr: false });
const RecentDepositsClient = dynamic(() => import('../../../components/RecentDepositsClient'), { ssr: false });
const EnhancedPoolStats = dynamic(() => import('../../../components/EnhancedPoolStats'), { ssr: false });

export const dynamicParams = false;

export function generateStaticParams() {
  const assets = [{ id: 'ETH', denoms: ['0.1', '1', '10'] }];
  const params: { asset: string; denom: string }[] = [];
  for (const a of assets) {
    for (const d of a.denoms) params.push({ asset: a.id, denom: d });
  }
  return params;
}

export default function PoolPage({ params }: { params: { asset: string; denom: string } }) {
  const asset = params?.asset || 'ETH';
  const denom = params?.denom || '1';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/pools/" className="text-sm text-blue-600">← Back to Pools</Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">{denom} {asset} Pool</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Fixed-denomination compliant pool</p>

        {/* Enhanced Pool Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Pool Statistics</h2>
          <EnhancedPoolStats asset={asset} denom={denom} network="ethereum" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-2">Quick Stats</div>
            <div className="text-sm text-gray-500">Anonymity Set</div>
            <PoolStatsClient asset={asset} denom={denom} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-2">Recent Deposits</div>
            <RecentDepositsClient asset={asset} denom={denom} />
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/deposit/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
            Deposit {denom} {asset}
          </Link>
          <Link href="/withdraw/" className="border hover:bg-gray-100 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded">
            Withdraw
          </Link>
        </div>
      </div>
    </div>
  );
}
