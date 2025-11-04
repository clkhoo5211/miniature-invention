"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { useToast } from './components/ToastProvider'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { show } = useToast()

  useEffect(() => {
    if (error) {
      console.error('App error captured:', error)
      show('An unexpected error occurred.', { title: 'Error', type: 'error' })
    }
  }, [error, show])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full border rounded-lg p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          We encountered an error while rendering this page. You can try again or go back to the homepage.
        </p>

        {error?.message && (
          <details className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            <summary className="cursor-pointer select-none">Show technical details</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all">{error.message}</pre>
            {error.digest && <div className="mt-2">Digest: {error.digest}</div>}
          </details>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}