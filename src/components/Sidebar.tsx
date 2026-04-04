import { useApp } from '@/context/AppContext';
import type { Lang } from '@/data/i18n';

const navItems = [
  { page: 'dashboard', icon: '📊', labelKey: 'nav_dashboard' },
  { page: 'pipeline', icon: '📋', labelKey: 'nav_pipeline', badge: true },
  { page: 'inbox', icon: '💬', labelKey: 'nav_inbox', inboxBadge: true },
  { page: 'deals', icon: '🎯', labelKey: 'nav_deals' },
  { page: 'invoices', icon: '📄', labelKey: 'nav_invoices' },
];

const navItems2 = [
  { page: 'reports', icon: '📈', labelKey: 'nav_reports' },
];

const navItems3 = [
  { page: 'templates', icon: '📝', labelKey: 'nav_templates' },
  { page: 'settings', icon: '⚙️', labelKey: 'nav_settings' },
];

export default function Sidebar() {
  const { currentPage, navigate, t, deals, chats, sidebarOpen, setSidebarOpen } = useApp();
  const totalUnread = chats.reduce((s, c) => s + c.unread, 0);
  const pipelineCount = deals.filter(d => !['won', 'lost'].includes(d.stage)).length;

  const renderNav = (items: typeof navItems) => items.map(item => {
    const isActive = currentPage === item.page;
    let badge = null;
    if (item.badge) badge = <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 rounded-full">{pipelineCount}</span>;
    if (item.inboxBadge && totalUnread > 0) badge = <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 rounded-full">{totalUnread}</span>;

    return (
      <button
        key={item.page}
        onClick={() => { navigate(item.page); setSidebarOpen(false); }}
        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-all mb-0.5 ${
          isActive
            ? 'bg-primary/30 text-sidebar-foreground'
            : 'text-sidebar-foreground/55 hover:bg-sidebar-foreground/7 hover:text-sidebar-foreground/85'
        }`}
      >
        <span className="text-base w-5 text-center">{item.icon}</span>
        <span>{t(item.labelKey)}</span>
        {badge}
      </button>
    );
  });

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`w-60 bg-sidebar flex flex-col flex-shrink-0 overflow-y-auto z-50 transition-transform
        fixed md:relative top-0 left-0 h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-sidebar-foreground/10">
          <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">🇱🇰 ChatClose LK</h1>
          <span className="text-[11px] text-sidebar-foreground/40">{t('tagline')}</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/25 px-2.5 py-2">{t('nav_main')}</div>
          {renderNav(navItems)}

          <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/25 px-2.5 py-2 mt-2">{t('nav_analytics')}</div>
          {renderNav(navItems2)}

          <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/25 px-2.5 py-2 mt-2">{t('nav_tools')}</div>
          {renderNav(navItems3)}
        </nav>

        {/* Footer */}
        <div className="px-3.5 py-4 border-t border-sidebar-foreground/10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-dot" />
            {t('wa_connected')}
          </div>
          <div className="mt-2.5 text-[11px] text-sidebar-foreground/35">
            +94 77 123 4567 · {t('plan_pro')}
          </div>
        </div>
      </aside>
    </>
  );
}
