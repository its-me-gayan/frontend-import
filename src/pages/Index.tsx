import { AppProvider, useApp } from '@/context/AppContext';
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

function AppContent() {
  const { currentPage } = useApp();

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    pipeline: <PipelinePage />,
    inbox: <InboxPage />,
    deals: <DealsPage />,
    invoices: <InvoicesPage />,
    reports: <ReportsPage />,
    templates: <TemplatesPage />,
    settings: <SettingsPage />,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {pages[currentPage] || <DashboardPage />}
        </main>
      </div>
      <DealModal />
      <InvoiceModal />
      <QuickMessageModal />
      <ToastContainer />
    </div>
  );
}

export default function Index() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
