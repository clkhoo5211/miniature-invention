import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import NavWalletClient from './components/NavWalletClient';
import { ToastProvider } from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Compliant Private Transfers',
  description: 'Privacy-forward, KYC-gated shielded transfers with zk proofs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          <ErrorBoundary>
            <nav className="border-b border-gray-200 dark:border-gray-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <Link href="/" className="flex items-center px-2 py-2 text-xl font-semibold">
                      Compliant Private Transfers
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Link href="/pools" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                      Pools
                    </Link>
                    <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                      Dashboard
                    </Link>
                    <Link href="/history" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                      History
                    </Link>
                    <NavWalletClient />
                  </div>
                </div>
              </div>
            </nav>
            <main>{children}</main>
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}

