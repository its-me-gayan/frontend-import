import { useApp } from '@/context/AppContext';
import type { Lang } from '@/data/i18n';
import { useState } from 'react';

export default function Navbar() {
  const { 
    t, lang, setLang, toggleDark, darkMode, showToast, 
    navigate, setSidebarOpen, whatsappConnected, whatsappNumbers, 
    activeNumberId, setActiveNumberId, doLogout 
  } = useApp();

  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const connectedCount = whatsappNumbers.length;
  const activeNumber = whatsappNumbers.find(n => n.id === activeNumberId);

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

        {/* WhatsApp status — PROMINENT DROPDOWN TRIGGER */}
        <div className="relative">
          <button
            onClick={() => setShowNumberDropdown(!showNumberDropdown)}
            className={`hidden sm:inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all border-2 ${
              whatsappConnected
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                : 'border-muted bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${whatsappConnected ? 'bg-emerald-500 animate-pulse-dot' : 'bg-muted-foreground'}`} />
            {whatsappConnected ? (
              <>
                <span className="hidden md:inline">
                  {activeNumberId === 'all'
                    ? `${connectedCount} Numbers`
                    : (activeNumber?.name ?? 'Connected')}
                </span>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </>
            ) : (
              <>
                <span>📱</span>
                {t('connect_wa')}
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNumberDropdown && whatsappConnected && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-2xl opacity-100 visible z-50 py-2">
              {/* Header */}
              <div className="px-4 py-2 border-b border-border">
                <div className="text-xs font-bold text-foreground">Active WhatsApp Line</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Select which number to use</div>
              </div>

              {/* View All Option */}
              <button
                onClick={() => {
                  setActiveNumberId('all');
                  setShowNumberDropdown(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-3 ${
                  activeNumberId === 'all'
                    ? 'bg-primary/10 text-primary border-l-2 border-l-primary'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  ALL
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">View All</div>
                  <div className="text-[10px] text-muted-foreground">See all numbers at once</div>
                </div>
              </button>

              {/* Individual Numbers */}
              {whatsappNumbers.map((num, idx) => (
                <button
                  key={num.id}
                  onClick={() => {
                    setActiveNumberId(num.id);
                    setShowNumberDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-3 border-l-2 ${
                    activeNumberId === num.id
                      ? 'bg-primary/10 text-primary border-l-primary'
                      : 'hover:bg-muted text-foreground border-l-transparent'
                  }`}
                >
                  {/* Color-coded avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                      idx === 0 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}
                  >
                    {num.name.split(' ')[0][0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{num.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{num.phone}</div>
                  </div>
                  {num.status === 'connected' && (
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0 animate-pulse-dot" />
                  )}
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-border my-1" />

              {/* Manage Numbers Link */}
              <button
                onClick={() => {
                  navigate('settings');
                  setShowNumberDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <span>⚙️</span> Manage Numbers
              </button>
            </div>
          )}
        </div>

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