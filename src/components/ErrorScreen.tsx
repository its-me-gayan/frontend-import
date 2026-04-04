import React from 'react';
import { useApp } from '@/context/AppContext';

/**
 * Full-page error screen shown when:
 *  - No auth token is present in localStorage
 *  - The initial backend hydration fails (network error, 401, 5xx, etc.)
 */
export default function ErrorScreen() {
  const { appError, retryHydration } = useApp();

  const isAuthError =
    appError?.toLowerCase().includes('401') ||
    appError?.toLowerCase().includes('token') ||
    appError?.toLowerCase().includes('log in');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isAuthError ? (
                // Lock icon for auth errors
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              ) : (
                // Wifi-off icon for network errors
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M3 3l18 18"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isAuthError ? 'Authentication Required' : 'Unable to Load Data'}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {appError}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isAuthError ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please log in to obtain a valid token, then refresh the page.
            </p>
          ) : (
            <button
              onClick={retryHydration}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            Refresh Page
          </button>
        </div>

      </div>
    </div>
  );
}