'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type Toast = { id: number; title?: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }

type ToastContextValue = {
  show: (message: string, options?: Omit<Toast, 'id' | 'message'> & { duration?: number }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, options?: Omit<Toast, 'id' | 'message'> & { duration?: number }) => {
    const toastId = Date.now()
    const duration = options?.duration || 4000
    setToasts((prev) => [...prev, { id: toastId, message, ...options }])
    // Auto dismiss after duration
    setTimeout(() => setToasts((prev) => prev.filter(t => t.id !== toastId)), duration)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-50 bottom-4 right-4 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[260px] max-w-[360px] px-4 py-3 rounded-md shadow-lg text-sm text-white ${
              t.type === 'success'
                ? 'bg-green-600'
                : t.type === 'warning'
                ? 'bg-yellow-600'
                : t.type === 'error'
                ? 'bg-red-600'
                : 'bg-gray-800'
            }`}
          >
            {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}


