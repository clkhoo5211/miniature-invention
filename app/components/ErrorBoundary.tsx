'use client'

import { Component, ReactNode } from 'react'

type Props = { 
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

type State = { 
  hasError: boolean; 
  error?: Error;
  errorId?: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    // Generate a unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Sanitize error message to prevent information leakage
    const sanitizedError = {
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      // Only include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { 
        originalMessage: error.message,
        stack: error.stack 
      })
    };

    // Log error securely (avoid logging sensitive data)
    console.error('UI Error Boundary:', sanitizedError);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    // reportError(sanitizedError);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              We encountered an unexpected error. Your data is safe.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.errorId && (
              <p className="text-xs text-gray-500 mb-4 font-mono">
                Error ID: {this.state.errorId}
              </p>
            )}
            <div className="space-x-3">
              <button
                onClick={this.handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}


