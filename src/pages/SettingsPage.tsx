import { useApp, type WhatsAppNumber } from '@/context/AppContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { t, showToast, whatsappNumbers, doLogout } = useApp();
  const [step, setStep] = useState(0); // 0=list, 1=form, 2=connecting
  const [form, setForm] = useState({ phone: '', name: '', accountId: '', apiToken: '' });

  const handleConnect = () => {
    if (!form.phone || !form.name || !form.apiToken) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setStep(2);
    // Simulate connection
    setTimeout(() => {
      showToast('New WhatsApp number connected! ✅', 'success');
      setStep(0);
      setForm({ phone: '', name: '', accountId: '', apiToken: '' });
    }, 2000);
  };

  return (
    <div className="max-w-[800px]">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-extrabold font-display text-foreground">{t('settings_title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('settings_subtitle')}</p>
        </div>
        <button 
          onClick={doLogout}
          className="bg-destructive/10 text-destructive text-xs font-bold px-4 py-2 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center gap-2"
        >
          <span>🚪</span> {t('logout') || 'Logout'}
        </button>
      </div>

      {/* WhatsApp Numbers Management */}
      <div className="bg-card border border-border rounded-lg p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold text-foreground">WhatsApp Business Numbers</div>
            <div className="text-xs text-muted-foreground mt-0.5">Manage your connected WhatsApp API lines</div>
          </div>
          {step === 0 && (
            <button 
              onClick={() => setStep(1)}
              className="bg-emerald-500 hover:bg-emerald-600 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition"
            >
              + Add Number
            </button>
          )}
        </div>

        {step === 0 && (
          <div className="space-y-3">
            {whatsappNumbers.map((num: WhatsAppNumber) => (
              <div key={num.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                    📱
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{num.name}</div>
                    <div className="text-xs text-muted-foreground">{num.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-dot" />
                    Connected
                  </div>
                  <button 
                    onClick={() => showToast('Number settings coming soon!', 'info')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</div>
              <span className="text-sm font-semibold text-foreground">Add new WhatsApp Business line</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Line Name (e.g. Sales, Support) *</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sales Team" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Business Phone Number *</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+94 7X XXX XXXX" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">WhatsApp Business Account ID</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} placeholder="1234567890123456" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Permanent API Token *</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  type="password" value={form.apiToken} onChange={e => setForm(f => ({ ...f, apiToken: e.target.value }))} placeholder="EAAxxxxxxxxxxxxx" />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-primary-foreground text-sm font-semibold px-5 py-2 rounded-lg transition"
                onClick={handleConnect}>✅ Connect Number</button>
              <button className="border border-border text-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition"
                onClick={() => setStep(0)}>Cancel</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm font-semibold text-foreground">Connecting to WhatsApp Business API...</div>
            <p className="text-xs text-muted-foreground mt-1">Verifying credentials for your new line</p>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="bg-card border border-border rounded-lg p-5 mb-5">
        <div className="text-sm font-bold text-foreground mb-4">👤 Business Profile</div>
        <div className="grid grid-cols-2 gap-3">
          {([
            ['Full Name', 'Gayan Perera'],
            ['Business Name', 'Gayan Perera Digital'],
            ['TIN Number (IRD)', '134567890V'],
            ['VAT Registration #', 'VAT-2024-00456'],
          ] as const).map(([label, val]) => (
            <div key={label}>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
              <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary" defaultValue={val} />
            </div>
          ))}
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Business Address</label>
            <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              defaultValue="No. 45, Galle Road, Colombo 03, Sri Lanka" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email</label>
            <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary" defaultValue="gayan@gayandigital.lk" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Phone</label>
            <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary" defaultValue="+94 77 123 4567" />
          </div>
        </div>
        <button className="mt-3 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          onClick={() => showToast('Profile saved! ✓', 'success')}>Save Profile</button>
      </div>

      {/* Billing */}
      <div className="bg-card border border-border rounded-lg p-5 mb-5">
        <div className="text-sm font-bold text-foreground mb-1">💳 Billing & Plan</div>
        <div className="text-xs text-muted-foreground mb-4">Manage your subscription</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Starter', price: 'LKR 2,990', features: '1 WhatsApp number, 5 users, 500 deals', current: false },
            { name: 'Pro', price: 'LKR 7,990', features: '3 WhatsApp numbers, 15 users, unlimited deals, reports', current: true },
            { name: 'Enterprise', price: 'LKR 19,990', features: 'Unlimited everything, API access, priority support', current: false },
          ].map(plan => (
            <div key={plan.name} className={`border rounded-lg p-4 transition-all ${plan.current ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <div className="text-sm font-bold text-foreground">{plan.name}</div>
              <div className="text-lg font-extrabold text-primary mt-1">{plan.price}</div>
              <div className="text-[10px] text-muted-foreground mt-2 leading-relaxed">{plan.features}</div>
              {plan.current ? (
                <div className="mt-3 text-[10px] font-bold text-primary text-center bg-primary/10 py-1 rounded">CURRENT PLAN</div>
              ) : (
                <button className="mt-3 w-full text-[10px] font-bold border border-border py-1 rounded hover:bg-muted">UPGRADE</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
