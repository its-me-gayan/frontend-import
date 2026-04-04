import { useApp } from '@/context/AppContext';
import type { Lang } from '@/data/i18n';

export default function Navbar() {
  const { t, lang, setLang, toggleDark, darkMode, showToast, navigate, setSidebarOpen, whatsappConnected, notifications, showNotifications, toggleNotifications, markNotificationsRead } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-card border-b border-border px-4 h-[60px] flex items-center gap-3 flex-shrink-0 shadow-sm z-40">
      {/* Hamburger */}
      <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-md border border-border hover:bg-muted">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-[380px] relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          placeholder={t('search_placeholder')} />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Language */}
        <select
          value={lang}
          onChange={e => setLang(e.target.value as Lang)}
          className="bg-background border border-border rounded-md px-2.5 py-1.5 text-xs font-semibold text-foreground cursor-pointer outline-none"
        >
          <option value="en">🌐 EN</option>
          <option value="si">සිං</option>
          <option value="ta">த</option>
        </select>

        {/* Dark toggle */}
        <button onClick={toggleDark} className="p-1.5 rounded-md border border-border hover:bg-muted text-sm">
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* WhatsApp status */}
        <button onClick={() => whatsappConnected ? showToast('WhatsApp connected! 📱', 'success') : navigate('settings')}
          className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${whatsappConnected ? 'bg-emerald-500 hover:bg-emerald-600 text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
          {whatsappConnected ? <><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-dot" /> Connected</> : <><span>📱</span> {t('connect_wa')}</>}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-1.5 rounded-md border border-border hover:bg-muted transition-colors"
            onClick={toggleNotifications}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive rounded-full text-[9px] text-destructive-foreground flex items-center justify-center font-bold animate-in zoom-in duration-300">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={toggleNotifications} />
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                  <span className="text-xs font-bold text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markNotificationsRead}
                      className="text-[10px] font-semibold text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-foreground">{n.title}</span>
                          <span className="text-[9px] text-muted-foreground">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{n.body}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-2xl mb-2">🔔</div>
                      <div className="text-xs text-muted-foreground">No notifications yet</div>
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-border text-center bg-muted/10">
                  <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                    View all activity
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <button onClick={() => navigate('settings')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center text-primary-foreground font-bold text-xs">GP</div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-foreground">Gayan Perera</div>
            <div className="text-[10px] text-muted-foreground">{t('role_admin')}</div>
          </div>
        </button>
      </div>
    </header>
  );
}
