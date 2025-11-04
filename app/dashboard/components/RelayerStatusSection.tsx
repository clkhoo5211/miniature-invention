'use client';

import Link from 'next/link';

export default function RelayerStatusSection() {
  // 模拟数据 - 实际应用中应该从API获取
  const activeRelayers = 12;
  
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" aria-labelledby="relayer-heading">
      <div className="flex justify-between items-center mb-4">
        <h2 id="relayer-heading" className="text-xl font-semibold">Relayer Status</h2>
        <Link 
          href="/relayers" 
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          aria-label="View all relayers"
        >
          View All
        </Link>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4" role="status">
        <span className="font-medium">{activeRelayers}</span> active relayers available
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div 
            key={index}
            className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-center"
          >
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-medium">Relayer {index + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}