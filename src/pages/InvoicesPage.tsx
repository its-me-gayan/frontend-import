import { useApp } from '@/context/AppContext';
import { fmtLKR } from '@/lib/helpers';
import { INVOICES_DATA } from '@/data/mockData';

export default function InvoicesPage() {
  const { t, openInvoiceModal, showToast } = useApp();

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

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3.5 mb-6">
        {[
          { label: 'Total Invoiced', value: 'LKR 8.2M', change: '↑ 22% vs last month', border: 'kpi-border-blue' },
          { label: 'Paid', value: 'LKR 6.4M', change: '↑ 15 invoices', border: 'kpi-border-green' },
          { label: 'Outstanding', value: 'LKR 1.8M', change: '↓ 4 invoices overdue', border: 'kpi-border-gold' },
        ].map((k, i) => (
          <div key={i} className={`relative bg-card border border-border rounded-lg p-4 overflow-hidden ${k.border}`}>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className="text-xl font-extrabold font-display text-foreground mt-1.5">{k.value}</div>
            <div className={`text-xs font-semibold mt-1 ${k.change.startsWith('↑') ? 'text-emerald-600' : 'text-destructive'}`}>{k.change}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border text-sm font-bold text-foreground">Recent Invoices</div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Invoice #', 'Client', 'Company', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3.5 py-2.5 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVOICES_DATA.map(inv => (
              <tr key={inv.id} className="hover:bg-background transition-colors">
                <td className="px-3.5 py-3 border-b border-border"><code className="text-[11px] bg-background px-1.5 py-0.5 rounded">{inv.id}</code></td>
                <td className="px-3.5 py-3 border-b border-border text-sm font-semibold text-foreground">{inv.client}</td>
                <td className="px-3.5 py-3 border-b border-border text-sm text-muted-foreground">{inv.company}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-brand-50 border border-brand-200 rounded-lg">
        <div className="text-sm font-bold text-primary">ℹ️ Sri Lanka IRD Compliance Note (2026)</div>
        <div className="text-xs text-primary/80 mt-1.5 leading-relaxed">
          All invoices comply with IRD VAT requirements: Serial number format YYMMM_QQQQ_XXXXX, VAT rate 18%, supplier & purchaser TIN fields, place of supply, and amount in words (Rupees).
        </div>
      </div>
    </div>
  );
}
