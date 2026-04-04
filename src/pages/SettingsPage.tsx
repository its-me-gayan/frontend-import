import { useApp } from '@/context/AppContext';
import { type WaRouting, type WhatsAppNumber, PLAN_LIMITS } from '@/context/AppContext';
import { useState } from 'react';

// ─── Small reusable bits ──────────────────────────────────────────────────

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse-dot' : 'bg-muted-foreground'}`}
    />
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'green' | 'blue' | 'default' }) {
  const cls = {
    green:   'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
    blue:    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    default: 'bg-muted text-muted-foreground',
  }[variant];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  );
}

const ROUTING_LABELS: Record<WaRouting, string> = {
  deals:      'Deals',
  inbox:      'Inbox',
  invoices:   'Invoices',
  broadcasts: 'Broadcasts',
};

// ─── Empty add-number form state ──────────────────────────────────────────

const EMPTY_FORM = { phone: '', label: '', accountName: '', accountId: '', apiToken: '' };

// ─── Number card ──────────────────────────────────────────────────────────

function NumberCard({ num, onSetDefault, onDisconnect, onTest, onRoutingChange }: {
  num: WhatsAppNumber;
  onSetDefault: () => void;
  onDisconnect: () => void;
  onTest: () => void;
  onRoutingChange: (routing: WaRouting[]) => void;
}) {
  const [showRouting, setShowRouting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isConnected = num.status === 'connected';

  function toggleRoute(r: WaRouting) {
    const next = num.routing.includes(r)
      ? num.routing.filter(x => x !== r)
      : [...num.routing, r];
    onRoutingChange(next);
  }

  return (
    <div className={`border rounded-lg p-4 transition-all ${num.isDefault ? 'border-primary bg-primary/5' : 'border-border'}`}>
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-base flex-shrink-0">
          📱
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-foreground">{num.label}</span>
            {num.isDefault && <Badge variant="blue">Default</Badge>}
            <Badge variant={isConnected ? 'green' : 'default'}>
              <StatusDot connected={isConnected} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">{num.phone}</div>
          {num.accountId && (
            <div className="text-[11px] text-muted-foreground mt-0.5">WABA ID: {num.accountId}</div>
          )}

          {/* Routing tags */}
          {num.routing.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {num.routing.map(r => (
                <Badge key={r} variant="default">{ROUTING_LABELS[r]}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition text-foreground"
            onClick={onTest}
          >
            Test
          </button>
          <button
            className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition text-foreground"
            onClick={() => setShowRouting(v => !v)}
          >
            Routing
          </button>
          {!num.isDefault && (
            <button
              className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition text-foreground"
              onClick={onSetDefault}
            >
              Set default
            </button>
          )}
          <button
            className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 transition"
            onClick={() => setShowConfirm(true)}
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Routing checkboxes */}
      {showRouting && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs font-semibold text-muted-foreground mb-2">This number handles:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(ROUTING_LABELS) as WaRouting[]).map(r => (
              <label key={r} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={num.routing.includes(r)}
                  onChange={() => toggleRoute(r)}
                  className="rounded border-border accent-primary"
                />
                <span className="text-xs text-foreground">{ROUTING_LABELS[r]}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Disconnect confirm */}
      {showConfirm && (
        <div className="mt-3 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <div className="text-xs font-semibold text-foreground mb-1">⚠️ Disconnect this number?</div>
          <p className="text-[11px] text-muted-foreground mb-3">
            Messages routed through <strong>{num.phone}</strong> will stop. You can reconnect later.
          </p>
          <div className="flex gap-2">
            <button
              className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1.5 rounded-md hover:opacity-90 transition"
              onClick={() => { setShowConfirm(false); onDisconnect(); }}
            >
              Yes, disconnect
            </button>
            <button
              className="border border-border text-foreground text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-muted transition"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add-number wizard ────────────────────────────────────────────────────

function AddNumberForm({ onConnect, onCancel }: {
  onConnect: (config: typeof EMPTY_FORM) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [connecting, setConnecting] = useState(false);
  const { showToast } = useApp();

  function handleSubmit() {
    if (!form.phone.trim() || !form.label.trim() || !form.apiToken.trim()) {
      showToast('Phone, label and API token are required.', 'error');
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      onConnect({ ...form, accountName: form.accountName || form.label });
    }, 1800);
  }

  if (connecting) {
    return (
      <div className="border border-dashed border-border rounded-lg p-6 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-sm font-semibold text-foreground">Connecting to WhatsApp Business API…</div>
        <p className="text-xs text-muted-foreground mt-1">Verifying credentials and setting up webhooks</p>
      </div>
    );
  }

  const f = (field: keyof typeof EMPTY_FORM) => (
    <input
      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      value={form[field]}
      onChange={e => setForm(v => ({ ...v, [field]: e.target.value }))}
    />
  );

  return (
    <div className="border border-dashed border-border rounded-lg p-4">
      <div className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">+</span>
        Connect a new WhatsApp number
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Business phone *</label>
          {f('phone')}
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Display label *</label>
          {f('label')}
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Business account name</label>
          {f('accountName')}
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">WABA Account ID</label>
          {f('accountId')}
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Permanent API token *</label>
          <input
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            type="password"
            placeholder="EAAxxxxxxxxxxxxx"
            value={form.apiToken}
            onChange={e => setForm(v => ({ ...v, apiToken: e.target.value }))}
          />
        </div>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-3 mb-3">
        <div className="text-xs font-semibold text-foreground mb-1">📘 How to get your API token:</div>
        <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal list-inside">
          <li>Go to <span className="font-semibold text-primary">developers.facebook.com</span></li>
          <li>Navigate to your app → WhatsApp → API Setup</li>
          <li>Generate a Permanent Token under System Users</li>
          <li>Copy and paste it above</li>
        </ol>
      </div>

      <div className="flex gap-2">
        <button
          className="bg-emerald-500 hover:bg-emerald-600 text-primary-foreground text-sm font-semibold px-5 py-2 rounded-lg transition"
          onClick={handleSubmit}
        >
          ✅ Connect number
        </button>
        <button
          className="border border-border text-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const {
    t, showToast,
    whatsappNumbers, currentPlan, numberLimit, canAddNumber,
    addWhatsAppNumber, removeWhatsAppNumber, setDefaultNumber,
    updateNumberRouting, testNumberConnection,
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);

  const usedSlots = whatsappNumbers.length;
  const progressPct = numberLimit === Infinity ? 0 : Math.round((usedSlots / numberLimit) * 100);
  const progressColor =
    progressPct >= 100 ? 'bg-destructive' :
    progressPct >= 66  ? 'bg-amber-500' :
    'bg-emerald-500';

  function handleAddNumber(config: typeof EMPTY_FORM) {
    addWhatsAppNumber(config);
    setShowAddForm(false);
  }

  const PLAN_DISPLAY: Record<string, string> = {
    starter:    'Starter · 1 slot',
    pro:        'Pro · 3 slots',
    enterprise: 'Enterprise · unlimited',
  };

  return (
    <div className="max-w-[800px]">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold font-display text-foreground">{t('settings_title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('settings_subtitle')}</p>
      </div>

      {/* ── WhatsApp numbers ─────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg p-5 mb-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold text-foreground">WhatsApp Business Numbers</div>
            <div className="text-xs text-muted-foreground mt-0.5">Meta Business API · Cloud API v18.0</div>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground text-[10px] font-bold px-2.5 py-1 rounded-full">
            {PLAN_DISPLAY[currentPlan]}
          </span>
        </div>

        {/* Plan usage bar */}
        {numberLimit !== Infinity && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {usedSlots} of {numberLimit} number{numberLimit > 1 ? 's' : ''} used
            </span>
          </div>
        )}

        {/* Empty state */}
        {whatsappNumbers.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📱</div>
            <div className="text-sm font-bold text-foreground mb-1">No WhatsApp numbers connected</div>
            <p className="text-xs text-muted-foreground mb-4 max-w-[380px] mx-auto">
              Connect your WhatsApp Business API number to send messages, invoices, and updates directly from your pipeline.
            </p>
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-lg transition"
              onClick={() => setShowAddForm(true)}
            >
              🔗 Connect first number
            </button>
          </div>
        )}

        {/* Number cards */}
        {whatsappNumbers.length > 0 && (
          <div className="space-y-3 mb-3">
            {whatsappNumbers.map(num => (
              <NumberCard
                key={num.id}
                num={num}
                onSetDefault={() => setDefaultNumber(num.id)}
                onDisconnect={() => removeWhatsAppNumber(num.id)}
                onTest={() => testNumberConnection(num.id)}
                onRoutingChange={routing => updateNumberRouting(num.id, routing)}
              />
            ))}
          </div>
        )}

        {/* Add form */}
        {showAddForm && (
          <AddNumberForm
            onConnect={handleAddNumber}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Add button */}
        {!showAddForm && (
          <div>
            {canAddNumber ? (
              <button
                className="w-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary text-xs font-semibold py-2.5 rounded-lg transition mt-1"
                onClick={() => setShowAddForm(true)}
              >
                + Add another number
              </button>
            ) : (
              <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
                <strong>Plan limit reached.</strong> You're using all {numberLimit} slots on the {currentPlan} plan.{' '}
                <button
                  className="underline font-semibold"
                  onClick={() => showToast('Contact support to upgrade your plan.', 'info')}
                >
                  Upgrade to Enterprise
                </button>{' '}
                for unlimited numbers.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Business Profile ─────────────────────────────────────────── */}
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
              <input
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                defaultValue={val}
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Business Address</label>
            <input
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              defaultValue="No. 45, Galle Road, Colombo 03, Sri Lanka"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email</label>
            <input
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              defaultValue="gayan@gayandigital.lk"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Phone</label>
            <input
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              defaultValue="+94 77 123 4567"
            />
          </div>
        </div>
        <button
          className="mt-3 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          onClick={() => showToast('Profile saved! ✓', 'success')}
        >
          Save Profile
        </button>
      </div>

      {/* ── Billing & Plan ───────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg p-5 mb-5">
        <div className="text-sm font-bold text-foreground mb-1">💳 Billing & Plan</div>
        <div className="text-xs text-muted-foreground mb-4">Manage your subscription</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Starter', key: 'starter', price: 'LKR 2,990', features: `1 WhatsApp number, 5 users, 500 deals` },
            { name: 'Pro',     key: 'pro',     price: 'LKR 7,990', features: `3 WhatsApp numbers, 15 users, unlimited deals, reports` },
            { name: 'Enterprise', key: 'enterprise', price: 'LKR 19,990', features: `Unlimited numbers & everything, API access, priority support` },
          ].map(plan => {
            const isCurrent = plan.key === currentPlan;
            return (
              <div
                key={plan.name}
                className={`border rounded-lg p-4 transition-all ${isCurrent ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
              >
                <div className="text-sm font-bold text-foreground">{plan.name}</div>
                <div className="text-lg font-extrabold font-display text-primary mt-1">
                  {plan.price}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{plan.features}</div>
                <button
                  className={`mt-3 w-full text-xs font-semibold py-2 rounded-md transition ${isCurrent ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted text-foreground'}`}
                  onClick={() => showToast(isCurrent ? 'This is your current plan!' : `Upgrading to ${plan.name}…`, isCurrent ? 'info' : 'success')}
                >
                  {isCurrent ? '✓ Current Plan' : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Notifications ───────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="text-sm font-bold text-foreground mb-4">🔔 Notification Preferences</div>
        {[
          { label: 'New WhatsApp messages', desc: 'Get notified for incoming messages', on: true },
          { label: 'Deal stage changes',    desc: 'When a deal moves to a new stage', on: true },
          { label: 'Invoice reminders',     desc: 'Overdue payment alerts', on: true },
          { label: 'Weekly reports',        desc: 'Summary email every Monday', on: false },
        ].map((n, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <div>
              <div className="text-sm font-semibold text-foreground">{n.label}</div>
              <div className="text-xs text-muted-foreground">{n.desc}</div>
            </div>
            <button
              className={`relative w-[42px] h-[24px] rounded-full transition-colors ${n.on ? 'bg-primary' : 'bg-border'}`}
              onClick={() => showToast('Notification preference updated!', 'success')}
            >
              <span className={`absolute top-[3px] w-[18px] h-[18px] bg-card rounded-full transition-all shadow-sm ${n.on ? 'left-[21px]' : 'left-[3px]'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}