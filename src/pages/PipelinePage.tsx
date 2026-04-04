import { useApp } from '@/context/AppContext';
import { fmtLKR, getStageColor, getInitials, getProbBadge } from '@/lib/helpers';
import React, { useState, useMemo } from 'react';

const stages = [
  { id: 'new', labelKey: 'col_new', color: '#0f6fbd', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'quoted', labelKey: 'col_quoted', color: '#7c3aed', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'negotiation', labelKey: 'col_neg', color: '#d97706', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'won', labelKey: 'col_won', color: '#059669', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'lost', labelKey: 'col_lost', color: '#dc2626', bg: 'bg-red-50 dark:bg-red-900/20' },
];

export default function PipelinePage() {
  const { t, deals, moveDeal, openDealModal, showToast, openQuickMessage, activeNumberId, whatsappNumbers } = useApp();
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const activeNumber = useMemo(() => 
    whatsappNumbers.find(n => n.id === activeNumberId), 
    [whatsappNumbers, activeNumberId]
  );

  const filteredDeals = useMemo(() => {
    if (activeNumberId === 'all') return deals;
    return deals.filter(d => d.waNumber === activeNumber?.phone);
  }, [deals, activeNumberId, activeNumber]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-extrabold font-display text-foreground">
            {t('pipeline_title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeNumberId === 'all' 
              ? t('pipeline_subtitle')
              : `${t('pipeline_subtitle')} • ${activeNumber?.name}`}
          </p>
        </div>
        <button className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          onClick={() => showToast('Add Deal form coming soon! 📋', 'info')}>{t('add_deal')}</button>
      </div>

      {/* Number Filter — PROMINENT DISPLAY */}
      {whatsappNumbers.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => useApp().setActiveNumberId('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 flex items-center gap-2 ${
              activeNumberId === 'all'
                ? 'border-primary bg-primary/10 text-primary shadow-md'
                : 'border-border bg-background text-foreground hover:border-primary/50'
            }`}
          >
            <span className="text-base">📊</span>
            All Numbers ({deals.length})
          </button>

          {whatsappNumbers.map((num, idx) => {
            const numDeals = deals.filter(d => d.waNumber === num.phone);
            const isActive = activeNumberId === num.id;
            return (
              <button
                key={num.id}
                onClick={() => useApp().setActiveNumberId(num.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 flex items-center gap-2 ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-md'
                    : 'border-border bg-background text-foreground hover:border-emerald-500/50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse-dot' : 'bg-muted-foreground'}`}></div>
                <div className="flex flex-col items-start">
                  <span className="leading-tight">{num.name}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">{num.phone}</span>
                </div>
                <span className="ml-1 text-xs font-bold bg-background/50 px-2 py-0.5 rounded-full">{numDeals.length}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Stage totals */}
      <div className="flex gap-2.5 mb-4 overflow-x-auto pb-1">
        {stages.map(s => {
          const sDeals = filteredDeals.filter(d => d.stage === s.id);
          const total = sDeals.reduce((a, d) => a + d.value, 0);
          return (
            <div key={s.id} className="bg-card border border-border rounded-lg px-4 py-2.5 min-w-[150px] flex-shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.color }}>{t(s.labelKey)}</div>
              <div className="text-sm font-extrabold font-display text-foreground mt-0.5">{fmtLKR(total)}</div>
              <div className="text-[11px] text-muted-foreground">{sDeals.length} deal{sDeals.length !== 1 ? 's' : ''}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban */}
      <div className="flex gap-3.5 overflow-x-auto pb-4 min-h-[500px]">
        {stages.map(s => {
          const colDeals = filteredDeals.filter(d => d.stage === s.id);
          return (
            <div key={s.id} className="min-w-[260px] max-w-[260px] bg-background border border-border rounded-lg flex flex-col">
              <div className="px-3.5 py-3 border-b border-border flex items-center justify-between" style={{ borderTop: `3px solid ${s.color}` }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: s.color }}>{t(s.labelKey)}</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.bg}`} style={{ color: s.color }}>{colDeals.length}</span>
              </div>
              <div
                className={`p-2.5 flex-1 overflow-y-auto min-h-[100px] transition-colors ${dragOverCol === s.id ? 'kanban-drop-active' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOverCol(s.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => { e.preventDefault(); setDragOverCol(null); if (draggedId != null) moveDeal(draggedId, s.id); }}
              >
                {colDeals.map(deal => (
                  <div key={deal.id}
                    className={`bg-card border border-border rounded-lg p-3 mb-2 cursor-grab hover:shadow-md hover:-translate-y-px transition-all ${draggedId === deal.id ? 'opacity-40' : ''}`}
                    draggable
                    onDragStart={() => setDraggedId(deal.id)}
                    onDragEnd={() => setDraggedId(null)}
                    onClick={() => openDealModal(deal.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[13px] font-semibold text-foreground">{deal.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{deal.company} · {deal.city}</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: getStageColor(deal.stage) + '22', color: getStageColor(deal.stage) }}>
                        {getInitials(deal.name)}
                      </div>
                    </div>
                    <div className="text-[15px] font-bold font-display mt-2" style={{ color: '#0f6fbd' }}>{fmtLKR(deal.value)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1.5 bg-background p-1.5 rounded-md border-l-[3px] border-l-emerald-500 leading-relaxed">
                      💬 {deal.lastMsg.slice(0, 60)}{deal.lastMsg.length > 60 ? '...' : ''}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getProbBadge(deal.prob)}`}>{deal.prob}%</span>
                      <div className="flex items-center gap-1.5">
                        <button className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                          onClick={(e) => { e.stopPropagation(); openQuickMessage(deal.id); }}>
                          💬 Message
                        </button>
                        <span className="text-[11px] text-muted-foreground">📅 {deal.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
