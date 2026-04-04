import { useApp } from '@/context/AppContext';
import type { Lang } from '@/data/i18n';

export default function Navbar() {
  const { 
    t, lang, setLang, toggleDark, darkMode, showToast, 
    navigate, setSidebarOpen, whatsappConnected, whatsappNumbers, 
    activeNumberId, setActiveNumberId, doLogout 
  } = useApp();

  const connectedCount = whatsappNumbers.length;

  return (
    <header className="bg-card border-b border-border px-4 h-[60px] flex items-center gap-3 flex-shrink-0 shadow-sm z-40">
      {/* Hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden p-1.5 rounded-md border border-border hover:bg-muted"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-[380px] relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          placeholder={t('search_placeholder')}
        />
      </div>

      {/* Multi-number Switcher */}
      {whatsappConnected && (
        <div className="hidden lg:flex items-center bg-muted/50 border border-border rounded-lg p-1 mx-4">
          <button
            onClick={() => setActiveNumberId('all')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${activeNumberId === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            ALL
          </button>
          {whatsappNumbers.map(num => (
            <button
              key={num.id}
              onClick={() => setActiveNumberId(num.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 ${activeNumberId === num.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              {num.name.split(' ')[0].toUpperCase()}
            </button>
          ))}
        </div>
      )}

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

        {/* WhatsApp status — shows number count when multiple are connected */}
        <button
          onClick={() => {
            if (whatsappConnected) {
              if (connectedCount > 1) {
                showToast(`${connectedCount} WhatsApp numbers active 📱`, 'success');
              } else {
                showToast(`WhatsApp connected: ${whatsappNumbers[0]?.phone ?? ''} 📱`, 'success');
              }
            } else {
              navigate('settings');
            }
          }}
          className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
            whatsappConnected
              ? 'bg-emerald-500 hover:bg-emerald-600 text-primary-foreground'
              : 'border border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          {whatsappConnected ? (
            <>
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-dot" />
              {connectedCount > 1 ? `${connectedCount} numbers` : 'Connected'}
            </>
          ) : (
            <>
              <span>📱</span>
              {t('connect_wa')}
            </>
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative p-1.5 rounded-md border border-border hover:bg-muted"
          onClick={() => showToast('3 new WhatsApp messages! 💬', 'success')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive rounded-full text-[9px] text-destructive-foreground flex items-center justify-center font-bold">
            3
          </span>
        </button>

        {/* User */}
        <div className="relative group">
          <button className="flex items-center gap-2 hover:bg-muted p-1 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center text-primary-foreground font-bold text-xs">GP</div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-foreground">Gayan Perera</div>
              <div className="text-[10px] text-muted-foreground">{t('role_admin')}</div>
            </div>
          </button>
          <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-1 z-50">
            <div className="px-4 py-2 border-b border-border md:hidden">
              <div className="text-xs font-bold text-foreground">Gayan Perera</div>
              <div className="text-[10px] text-muted-foreground">{t('role_admin')}</div>
            </div>
            <button 
              onClick={() => navigate('settings')}
              className="w-full text-left px-4 py-2 text-[11px] font-medium hover:bg-muted flex items-center gap-2"
            >
              <span>⚙️</span> {t('nav_settings')}
            </button>
            <button 
              onClick={doLogout}
              className="w-full text-left px-4 py-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2"
            >
              <span>🚪</span> {t('logout') || 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
