import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import ErrorScreen from '@/components/ErrorScreen';
// import your real page components below
// import Dashboard from '@/pages/Dashboard';
// import Inbox from '@/pages/Inbox';
// ...

// ---------------------------------------------------------------------------
// Inner shell – rendered inside AppProvider so it can read context
// ---------------------------------------------------------------------------
function AppShell() {
  const { isLoading, appError, currentPage } = useApp();

  // 1. Loading spinner while fetching pipeline + inbox
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  // 2. Error screen when hydration failed or no token
  if (appError) {
    return <ErrorScreen />;
  }

  // 3. Normal app routing
  return (
    <div>
      {/* Replace with your actual router / page switcher */}
      {currentPage === 'dashboard' && <div>Dashboard page</div>}
      {currentPage === 'inbox'     && <div>Inbox page</div>}
      {/* … */}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root – wrap everything in the provider
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}