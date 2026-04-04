import { useApp } from '@/context/AppContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { t, showToast, whatsappConnected, whatsappConnecting, whatsappConfig, connectWhatsApp, disconnectWhatsApp } = useApp();
  const [step, setStep] = useState(0); // 0=idle, 1=form, 2=connecting
  const [form, setForm] = useState({ phone: '+94 77 123 4567', accountName: 'Gayan Perera Digital', accountId: '', apiToken: '' });
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleConnect = () => {
    if (!form.phone || !form.accountName || !form.apiToken) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setStep(2);
    connectWhatsApp(form);
  };

  return (
    <div className="max-w-[800px]">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold font-display text-foreground">{t('settings_title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('settings_subtitle')}</p>
      </div>

      {/* WhatsApp Connection */}
      <div className="bg-card border border-border rounded-lg p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold text-foreground">WhatsApp Business Connection</div>
            <div className="text-xs text-muted-foreground mt-0.5">Meta Business API · Cloud API v18.0</div>
          </div>
          {whatsappConnected ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-dot" />
              Connected
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground text-[11px] font-bold px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
              Disconnected
            </div>
          )}
        </div>

        {/* Connected State */}
        {whatsappConnected && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Business Phone Number</label>
                <div className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">{whatsappConfig.phone}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Business Account Name</label>
                <div className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">{whatsappConfig.accountName}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">WhatsApp Business Account ID</label>
                <div className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">{whatsappConfig.accountId || '—'}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">API Token</label>
                <div className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">••••••••••••</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="border border-border text-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition"
                onClick={() => showToast('Testing connection...', 'info')}>🔄 Test Connection</button>
              <button className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition"
                onClick={() => setShowDisconnectConfirm(true)}>Disconnect</button>
            </div>

            {/* Disconnect confirmation */}
            {showDisconnectConfirm && (
              <div className="mt-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <div className="text-sm font-semibold text-foreground mb-1">⚠️ Disconnect WhatsApp?</div>
                <p className="text-xs text-muted-foreground mb-3">This will stop all automated messages and remove the API connection. You can reconnect later.</p>
                <div className="flex gap-2">
                  <button className="bg-destructive text-destructive-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
                    onClick={() => { disconnectWhatsApp(); setShowDisconnectConfirm(false); }}>Yes, Disconnect</button>
                  <button className="border border-border text-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:bg-muted transition"
                    onClick={() => setShowDisconnectConfirm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Disconnected State — Connect Wizard */}
        {!whatsappConnected && step === 0 && (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📱</div>
            <div className="text-sm font-bold text-foreground mb-1">Connect your WhatsApp Business API</div>
            <p className="text-xs text-muted-foreground mb-4 max-w-[400px] mx-auto">
              Send messages, invoices, and updates directly from your pipeline. You need a Meta Business API token to get started.
            </p>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-lg transition"
              onClick={() => setStep(1)}>🔗 Start Connection Setup</button>
          </div>
        )}

        {/* Step 1: Form */}
        {!whatsappConnected && step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</div>
              <span className="text-sm font-semibold text-foreground">Enter your WhatsApp Business API credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Business Phone Number *</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+94 7X XXX XXXX" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Business Account Name *</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} placeholder="Your Business Name" />
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
            <div className="bg-muted/50 border border-border rounded-lg p-3 mb-4">
              <div className="text-xs font-semibold text-foreground mb-1">📘 How to get your API Token:</div>
              <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to <span className="font-semibold text-primary">developers.facebook.com</span></li>
                <li>Navigate to your app → WhatsApp → API Setup</li>
                <li>Generate a Permanent Token under System Users</li>
                <li>Copy and paste it above</li>
              </ol>
            </div>
            <div className="flex gap-2">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-primary-foreground text-sm font-semibold px-5 py-2 rounded-lg transition"
                onClick={handleConnect}>✅ Connect WhatsApp</button>
              <button className="border border-border text-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition"
                onClick={() => setStep(0)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Step 2: Connecting */}
        {!whatsappConnected && step === 2 && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm font-semibold text-foreground">Connecting to WhatsApp Business API...</div>
            <p className="text-xs text-muted-foreground mt-1">Verifying credentials and setting up webhooks</p>
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
              <div className="text-lg font-extrabold font-display text-primary mt-1">{plan.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
              <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{plan.features}</div>
              <button className={`mt-3 w-full text-xs font-semibold py-2 rounded-md transition ${plan.current ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted text-foreground'}`}
                onClick={() => showToast(plan.current ? 'This is your current plan!' : `Upgrading to ${plan.name}...`, plan.current ? 'info' : 'success')}>
                {plan.current ? '✓ Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="text-sm font-bold text-foreground mb-4">🔔 Notification Preferences</div>
        {[
          { label: 'New WhatsApp messages', desc: 'Get notified for incoming messages', on: true },
          { label: 'Deal stage changes', desc: 'When a deal moves to a new stage', on: true },
          { label: 'Invoice reminders', desc: 'Overdue payment alerts', on: true },
          { label: 'Weekly reports', desc: 'Summary email every Monday', on: false },
        ].map((n, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <div>
              <div className="text-sm font-semibold text-foreground">{n.label}</div>
              <div className="text-xs text-muted-foreground">{n.desc}</div>
            </div>
            <button className={`relative w-[42px] h-[24px] rounded-full transition-colors ${n.on ? 'bg-primary' : 'bg-border'}`}
              onClick={() => showToast('Notification preference updated!', 'success')}>
              <span className={`absolute top-[3px] w-[18px] h-[18px] bg-card rounded-full transition-all shadow-sm ${n.on ? 'left-[21px]' : 'left-[3px]'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
