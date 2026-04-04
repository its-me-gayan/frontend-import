import { useApp } from '@/context/AppContext';
import { useState } from 'react';

export default function QuickMessageModal() {
  const { quickMessageDealId, deals, closeQuickMessage, sendDealMessage, whatsappConnected, navigate, showToast } = useApp();
  const [text, setText] = useState('');

  if (quickMessageDealId === null) return null;
  const deal = deals.find(d => d.id === quickMessageDealId);
  if (!deal) return null;

  if (!whatsappConnected) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-5"
        onClick={e => { if (e.target === e.currentTarget) closeQuickMessage(); }}>
        <div className="bg-card rounded-xl w-full max-w-[400px] p-6 shadow-2xl text-center">
          <div className="text-3xl mb-3">📱</div>
          <div className="text-sm font-bold text-foreground mb-1">WhatsApp Not Connected</div>
          <p className="text-xs text-muted-foreground mb-4">Connect your WhatsApp Business API first to send messages.</p>
          <div className="flex gap-2 justify-center">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg transition"
              onClick={() => { closeQuickMessage(); navigate('settings'); }}>Go to Settings</button>
            <button className="border border-border text-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition"
              onClick={closeQuickMessage}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!text.trim()) return;
    sendDealMessage(deal.id, text.trim());
    setText('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-5"
      onClick={e => { if (e.target === e.currentTarget) closeQuickMessage(); }}>
      <div className="bg-card rounded-xl w-full max-w-[480px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
            {deal.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">{deal.name}</div>
            <div className="text-[11px] text-white/70">{deal.phone} · via Business API</div>
          </div>
          <button className="text-white/80 hover:text-white text-lg" onClick={closeQuickMessage}>✕</button>
        </div>

        {/* Message area */}
        <div className="p-4">
          <div className="text-xs text-muted-foreground mb-2">
            💬 Last message: <span className="italic">"{deal.lastMsg.slice(0, 60)}{deal.lastMsg.length > 60 ? '...' : ''}"</span>
          </div>
          <textarea
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-emerald-500 resize-none"
            rows={3}
            placeholder="Type your message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            autoFocus
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-muted-foreground">Press Enter to send</span>
            <div className="flex gap-2">
              <button className="border border-border text-foreground text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-muted transition"
                onClick={closeQuickMessage}>Cancel</button>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-md transition flex items-center gap-1.5"
                onClick={handleSend} disabled={!text.trim()}>
                📤 Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
