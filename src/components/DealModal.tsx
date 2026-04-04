import { useApp } from '@/context/AppContext';
import { fmtLKR, getInitials, getStageColor, getProbBadge } from '@/lib/helpers';

const stages = ['new', 'quoted', 'negotiation', 'won', 'lost'];
const stageLabels: Record<string, string> = { new: 'New Leads', quoted: 'Quoted', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' };
const stageColors: Record<string, string> = { new: '#0f6fbd', quoted: '#7c3aed', negotiation: '#d97706', won: '#059669', lost: '#dc2626' };

export default function DealModal() {
  const { dealModalId, deals, chats, closeDealModal, moveDeal, openInvoiceModal, showToast, t, openQuickMessage } = useApp();
  if (dealModalId === null) return null;

  const deal = deals.find(d => d.id === dealModalId);
  if (!deal) return null;
  const chat = chats.find(c => c.phone === deal.phone);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5"
      onClick={e => { if (e.target === e.currentTarget) closeDealModal(); }}>
      <div className="bg-card rounded-2xl w-full max-w-[860px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: getStageColor(deal.stage) + '22', color: getStageColor(deal.stage) }}>{getInitials(deal.name)}</div>
              <div>
                <h3 className="text-lg font-extrabold font-display text-foreground">{deal.name}</h3>
                <p className="text-xs text-muted-foreground">{deal.company} · {deal.city} · {deal.phone}</p>
                <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{deal.tag}</span>
              </div>
            </div>
            <button className="text-sm font-semibold border border-border rounded-md px-3 py-1.5 hover:bg-muted transition" onClick={closeDealModal}>{t('close_modal')}</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-background rounded-lg p-3.5 text-center">
              <div className="text-[10px] text-muted-foreground font-bold uppercase">Deal Value</div>
              <div className="text-xl font-extrabold font-display text-primary mt-1">{fmtLKR(deal.value)}</div>
            </div>
            <div className="bg-background rounded-lg p-3.5 text-center">
              <div className="text-[10px] text-muted-foreground font-bold uppercase">Probability</div>
              <div className="text-xl font-extrabold font-display mt-1" style={{ color: getStageColor(deal.stage) }}>{deal.prob}%</div>
            </div>
            <div className="bg-background rounded-lg p-3.5 text-center">
              <div className="text-[10px] text-muted-foreground font-bold uppercase">Due Date</div>
              <div className="text-base font-extrabold font-display mt-1">{deal.dueDate}</div>
            </div>
          </div>

          {/* Stage Changer */}
          <div className="mb-5">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('deal_stage')}</div>
            <div className="flex gap-1.5 flex-wrap">
              {stages.map(s => (
                <button key={s}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${deal.stage === s ? 'text-primary-foreground' : 'border hover:opacity-80'}`}
                  style={deal.stage === s ? { background: stageColors[s] } : { borderColor: stageColors[s], color: stageColors[s] }}
                  onClick={() => { moveDeal(deal.id, s); closeDealModal(); }}>
                  {stageLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Product & Notes */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Product / Service</div>
              <div className="bg-background rounded-lg p-3 text-sm text-foreground">{deal.product}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Assigned To</div>
              <div className="bg-background rounded-lg p-3 text-sm text-foreground">{deal.assignee}</div>
            </div>
          </div>

          <div className="mb-5">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('deal_notes')}</div>
            <textarea className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary resize-y" rows={3} defaultValue={deal.notes} />
          </div>

          {/* Chat History */}
          {chat && (
            <div className="mb-5">
              <div className="text-xs font-bold text-muted-foreground uppercase mb-2">WhatsApp History</div>
              <div className="chat-bg-light rounded-lg p-3 max-h-[180px] overflow-y-auto">
                {chat.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'} mb-1.5`}>
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 text-xs leading-relaxed shadow-sm ${m.from === 'me' ? 'msg-outgoing' : 'bg-card'}`}>
                      {m.text}
                      <div className="text-[10px] text-muted-foreground text-right mt-0.5">{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 flex-wrap pt-4 border-t border-border">
            <button className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
              onClick={() => { closeDealModal(); openInvoiceModal(deal.id); }}>{t('generate_invoice')}</button>
            <button className="bg-emerald-500 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
              onClick={() => { closeDealModal(); openQuickMessage(deal.id); }}>{t('send_wa')}</button>
            <button className="border border-border text-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition"
              onClick={() => showToast('Deal saved! ✓', 'success')}>💾 Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
