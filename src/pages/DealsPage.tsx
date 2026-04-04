import { useApp } from '@/context/AppContext';
import { fmtLKR, getInitials, getStageColor, getProbBadge } from '@/lib/helpers';
import { useState } from 'react';

export default function DealsPage() {
  const { t, deals, openDealModal, openInvoiceModal, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const stageLabels: Record<string, string> = { new: 'New Leads', quoted: 'Quoted', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' };
  const stageBadge: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    quoted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    negotiation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    won: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const filtered = deals.filter(d =>
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.company.toLowerCase().includes(search.toLowerCase())) &&
    (stageFilter === '' || d.stage === stageFilter)
  );

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-extrabold font-display text-foreground">{t('deals_title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('deals_subtitle')}</p>
        </div>
        <button className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          onClick={() => showToast('Add Deal form coming soon!', 'info')}>+ New Deal</button>
      </div>

      <div className="flex gap-2.5 mb-4 flex-wrap">
        <input className="bg-background border border-border rounded-lg px-3 py-2 text-sm w-[220px] text-foreground outline-none focus:border-primary"
          placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm w-[140px] text-foreground outline-none"
          value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
          <option value="">All Stages</option>
          {Object.entries(stageLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Client', 'Company', 'Value', 'Stage', 'Probability', 'Due Date', 'Assigned', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3.5 py-2.5 border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-background transition-colors">
                  <td className="px-3.5 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold" style={{ background: getStageColor(d.stage) + '22', color: getStageColor(d.stage) }}>{getInitials(d.name)}</div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{d.name}</div>
                        <div className="text-[11px] text-muted-foreground">{d.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 border-b border-border text-sm text-foreground">{d.company}</td>
                  <td className="px-3.5 py-3 border-b border-border text-sm font-bold font-display text-primary">{fmtLKR(d.value)}</td>
                  <td className="px-3.5 py-3 border-b border-border"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${stageBadge[d.stage]}`}>{stageLabels[d.stage]}</span></td>
                  <td className="px-3.5 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-[60px] h-1.5 bg-border rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${d.prob}%`, background: getStageColor(d.stage) }} /></div>
                      <span className="text-xs font-semibold">{d.prob}%</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 border-b border-border text-sm text-muted-foreground">{d.dueDate}</td>
                  <td className="px-3.5 py-3 border-b border-border text-sm text-muted-foreground">{d.assignee}</td>
                  <td className="px-3.5 py-3 border-b border-border">
                    <div className="flex gap-1.5">
                      <button className="text-xs font-semibold border border-border rounded-md px-2.5 py-1 hover:bg-muted transition" onClick={() => openDealModal(d.id)}>View</button>
                      <button className="text-xs font-semibold bg-emerald-500 text-primary-foreground rounded-md px-2.5 py-1 hover:bg-emerald-600 transition" onClick={() => openInvoiceModal(d.id)}>Invoice</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
