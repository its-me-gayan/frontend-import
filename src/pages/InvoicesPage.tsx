import { useApp } from '@/context/AppContext';
import { fmtLKR, getWaNumberStyle } from '@/lib/helpers';
import { INVOICES_DATA } from '@/data/mockData';
import { useMemo, useState } from 'react';

export default function InvoicesPage() {
  const { t, openInvoiceModal, showToast, deals, whatsappNumbers } = useApp();
  const [lineFilter, setLineFilter] = useState('');

  // Derive waNumber for each invoice by matching client name → deal
  const invoices = useMemo(() =>
    INVOICES_DATA.map(inv => ({
      ...inv,
      waNumber: deals.find(d => d.name === inv.client)?.waNumber,
    })),
    [deals]
  );

  const filtered = lineFilter
    ? invoices.filter(inv => inv.waNumber === lineFilter)
    : invoices;

  // Per-number totals for KPI breakdown
  const byNumber = useMemo(() =>
    whatsappNumbers.map(num => ({
      num,
      style: getWaNumberStyle(num.phone, whatsappNumbers),
      total: invoices.filter(i => i.waNumber === num.phone).reduce((s, i) => s + i.amount, 0),
      paid:  invoices.filter(i => i.waNumber === num.phone && i.status === 'paid').reduce((s, i) => s + i.amount, 0),
      outstanding: invoices.filter(i => i.waNumber === num.phone && i.status !== 'paid').reduce((s, i) => s + i.amount, 0),
    })),
    [invoices, whatsappNumbers]
  );

  const totals = {
    total: invoices.reduce((s, i) => s + i.amount, 0),
    paid:  invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
    outstanding: invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0),
  };

  return (
    <div className="max-w-[1000px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold font-display text-foreground">{t('invoices_title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('invoices_subtitle')}</p>
        </div>
        <button className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          onClick={() => openInvoiceModal(1)}>+ New Invoice</button>
      </div>

      {/* KPIs with per-number breakdown */}
      <div className="grid grid-cols-3 gap-3.5 mb-6">
        {[
          { label: 'Total Invoiced', value: totals.total,       change: '↑ 22% vs last month', border: 'kpi-border-blue',  key: 'total' as const },
          { label: 'Paid',           value: totals.paid,        change: '↑ 15 invoices',        border: 'kpi-border-green', key: 'paid' as const },
          { label: 'Outstanding',    value: totals.outstanding, change: '↓ 4 invoices overdue', border: 'kpi-border-gold',  key: 'outstanding' as const },
        ].map((k) => (
          <div key={k.label} className={`relative bg-card border border-border rounded-lg p-4 overflow-hidden ${k.border}`}>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className="text-xl font-extrabold font-display text-foreground mt-1.5">{fmtLKR(k.value)}</div>
            <div className={`text-xs font-semibold mt-1 ${k.change.startsWith('↑') ? 'text-emerald-600' : 'text-destructive'}`}>{k.change}</div>

            {/* Per-number breakdown — only shown when multiple numbers connected */}
            {byNumber.length > 1 && (
              <div className="mt-2.5 pt-2.5 border-t border-border space-y-1.5">
                {byNumber.map(({ num, style, ...vals }) => (
                  <div key={num.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                      <span className="text-[10px] text-muted-foreground truncate">{num.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-foreground flex-shrink-0">
                      {fmtLKR(vals[k.key])}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="text-sm font-bold text-foreground">Recent Invoices</div>
          {whatsappNumbers.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Line:</span>
              <select
                className="bg-background border border-border rounded-md px-2.5 py-1 text-xs text-foreground outline-none"
                value={lineFilter}
                onChange={e => setLineFilter(e.target.value)}
              >
                <option value="">All lines</option>
                {whatsappNumbers.map(n => (
                  <option key={n.id} value={n.phone}>{n.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Invoice #', 'Client', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3.5 py-2.5 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const style = inv.waNumber ? getWaNumberStyle(inv.waNumber, whatsappNumbers) : null;
              return (
                <tr key={inv.id} className="hover:bg-background transition-colors">
                  <td className="px-3.5 py-3 border-b border-border"><code className="text-[11px] bg-background px-1.5 py-0.5 rounded">{inv.id}</code></td>
                  <td className="px-3.5 py-3 border-b border-border">
                    <div className="text-sm font-semibold text-foreground">{inv.client}</div>
                    <div className="text-[11px] text-muted-foreground">{inv.company}</div>
                    {style?.found && (
                      <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.badge}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {style.name}
                      </div>
                    )}
                  </td>
                  <td className="px-3.5 py-3 border-b border-border text-sm font-bold font-display text-primary">{fmtLKR(inv.amount)}</td>
                  <td className="px-3.5 py-3 border-b border-border text-sm text-muted-foreground">{inv.date}</td>
                  <td className="px-3.5 py-3 border-b border-border">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                      {inv.status === 'paid' ? '✓ Paid' : 'Sent'}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 border-b border-border">
                    <div className="flex gap-1.5">
                      <button className="text-xs font-semibold border border-border rounded-md px-2.5 py-1 hover:bg-muted transition" onClick={() => showToast('Opening invoice preview...', 'info')}>View</button>
                      <button className="text-xs font-semibold bg-primary text-primary-foreground rounded-md px-2.5 py-1 hover:opacity-90 transition" onClick={() => window.print()}>Print</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-brand-50 border border-brand-200 rounded-lg">
        <div className="text-sm font-bold text-primary">ℹ️ Sri Lanka IRD Compliance Note (2026)</div>
        <div className="text-xs text-primary/80 mt-1.5 leading-relaxed">
          All invoices comply with IRD VAT requirements: Serial number format YYMMM_QQQQ_XXXXX, VAT rate 18%, supplier &amp; purchaser TIN fields, place of supply, and amount in words (Rupees).
        </div>
      </div>
    </div>
  );
}