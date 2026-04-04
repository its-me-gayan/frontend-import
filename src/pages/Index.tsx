import { AppProvider, useApp } from '@/context/AppContext';
import LoginPage from '@/pages/LoginPage';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ToastContainer from '@/components/ToastContainer';
import DealModal from '@/components/DealModal';
import InvoiceModal from '@/components/InvoiceModal';
import QuickMessageModal from '@/components/QuickMessageModal';
import DashboardPage from '@/pages/DashboardPage';
import PipelinePage from '@/pages/PipelinePage';
import InboxPage from '@/pages/InboxPage';
import DealsPage from '@/pages/DealsPage';
import InvoicesPage from '@/pages/InvoicesPage';
import ReportsPage from '@/pages/ReportsPage';
import TemplatesPage from '@/pages/TemplatesPage';
import SettingsPage from '@/pages/SettingsPage';

// ── Loading spinner ──────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#0f6fbd]/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#0f6fbd] animate-spin" />
        </div>
        <p className="text-sm text-[#8b949e]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Loading your workspace…
        </p>
      </div>
    </div>
  );
}

// ── Error screen (network / server failure only) ─────────────────────────────
function ErrorScreen() {
  const { appError, retryHydration } = useApp();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117] px-4">
      <div
        className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-xl p-10 max-w-sm w-full text-center space-y-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-red-900/30 border border-red-800/40 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M3 3l18 18" />
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[#f0f6fc] mb-2"
            style={{ fontFamily: "'Sora', sans-serif" }}>
            Unable to reach server
          </h1>
          <p className="text-sm text-[#8b949e]">{appError}</p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={retryHydration}
            className="w-full py-2.5 px-4 rounded-lg bg-[#0f6fbd] hover:bg-[#0d5fa0] text-white text-sm font-semibold transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 rounded-lg border border-[#30363d] text-[#8b949e] text-sm hover:bg-[#1c2128] transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Authenticated app shell (original layout) ────────────────────────────────
function AppContent() {
  const { currentPage } = useApp();

  const pages: Record<string, React.ReactNode> = {
    dashboard:  <DashboardPage />,
    pipeline:   <PipelinePage />,
    inbox:      <InboxPage />,
    deals:      <DealsPage />,
    invoices:   <InvoicesPage />,
    reports:    <ReportsPage />,
    templates:  <TemplatesPage />,
    settings:   <SettingsPage />,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {pages[currentPage] ?? <DashboardPage />}
        </main>
      </div>
      <DealModal />
      <InvoiceModal />
      <QuickMessageModal />
      <ToastContainer />
    </div>
  );
}

// ── Auth gate: decides what to render ────────────────────────────────────────
function AppGate() {
  const { isAuthenticated, isLoading, appError } = useApp();

  if (isLoading)        return <LoadingScreen />;
  if (appError)         return <ErrorScreen />;
  if (!isAuthenticated) return <LoginPage />;

  return <AppContent />;
}

// ── Entry point ──────────────────────────────────────────────────────────────
export default function Index() {
  return (
    <AppProvider>
      <AppGate />
    </AppProvider>
  );
}