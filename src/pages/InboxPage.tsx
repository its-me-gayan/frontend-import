import { useApp } from '@/context/AppContext';
import { getInitials, formatPhoneForApi } from '@/lib/helpers';
import { useState, useEffect, useRef, useMemo } from 'react';

export default function InboxPage() {
  const { t, chats, currentChatId, setCurrentChatId, sendMessage, openDealModal, showToast, markChatRead, deals, activeNumberId, whatsappNumbers } = useApp();
  const [msgText, setMsgText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const msgsEndRef = useRef<HTMLDivElement>(null);

  const activeNumber = useMemo(() => 
    whatsappNumbers.find(n => n.id === activeNumberId), 
    [whatsappNumbers, activeNumberId]
  );

  const filteredChats = useMemo(() => {
    let list = chats;
    if (activeNumberId !== 'all') {
      list = chats.filter(c => c.waNumber === activeNumber?.phone);
    }
    if (searchQuery) {
      list = list.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [chats, activeNumberId, activeNumber, searchQuery]);

  const currentChat = chats.find(c => c.id === currentChatId);
  const deal = currentChat ? deals.find(d => d.phone === currentChat.phone) : null;

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages.length]);

  const handleSend = () => {
    if (!msgText.trim()) return;
    sendMessage(currentChatId!, msgText);
    setMsgText('');
  };

  const handleSendViaApi = () => {
    if (!msgText.trim() || !currentChat) return;
    const phone = formatPhoneForApi(currentChat.phone);
    showToast(`📱 Sending via WhatsApp Business API to ${phone}...`, 'info');
    // Simulate API call
    setTimeout(() => {
      sendMessage(currentChatId!, msgText);
      setMsgText('');
      showToast(`✅ Message delivered via WhatsApp Business API to ${currentChat.name}`, 'success');
    }, 1000);
  };

  const handleSelectChat = (chatId: number) => {
    setCurrentChatId(chatId);
    markChatRead(chatId);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-extrabold font-display text-foreground">
          {t('inbox_title')} {activeNumberId !== 'all' && <span className="text-sm font-normal text-muted-foreground ml-2">({activeNumber?.name})</span>}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t('inbox_subtitle')}</p>
      </div>

      <div className="flex bg-card border border-border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 170px)' }}>
        {/* Chat List */}
        <div className="w-[300px] border-r border-border flex-shrink-0 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border">
            <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              placeholder={t('search_chats')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map(c => (
              <button key={c.id}
                onClick={() => handleSelectChat(c.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 border-b border-border text-left transition-colors hover:bg-background
                  ${c.id === currentChatId ? 'bg-primary/5 border-l-[3px] border-l-primary' : ''}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0"
                  style={{ background: c.color }}>{getInitials(c.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-semibold text-foreground truncate">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{c.time}</div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{c.messages[c.messages.length - 1]?.text}</div>
                  {activeNumberId === 'all' && c.waNumber && (
                    <div className="mt-1 flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                        {whatsappNumbers.find(n => n.phone === c.waNumber)?.name || 'WhatsApp'}
                      </span>
                    </div>
                  )}
                </div>
                {c.unread > 0 && (
                  <div className="w-[18px] h-[18px] bg-emerald-500 rounded-full text-[10px] font-bold text-primary-foreground flex items-center justify-center ml-1 flex-shrink-0">
                    {c.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col chat-bg-light">
          {currentChat ? (
            <>
              {/* Header */}
              <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm"
                  style={{ background: currentChat.color }}>{getInitials(currentChat.name)}</div>
                <div>
                  <div className="text-sm font-bold text-foreground">{currentChat.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] text-emerald-500 font-semibold">● Online</div>
                    {currentChat.waNumber && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">
                        via {whatsappNumbers.find(n => n.phone === currentChat.waNumber)?.name || 'WhatsApp'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  {deal && (
                    <button className="text-xs font-semibold border border-border rounded-md px-3 py-1.5 hover:bg-muted transition"
                      onClick={() => openDealModal(deal.id)}>📋 View Deal</button>
                  )}
                  <button className="text-xs font-semibold bg-emerald-500 text-primary-foreground rounded-md px-3 py-1.5 hover:bg-emerald-600 transition"
                    onClick={() => showToast(`Calling ${currentChat.name}... 📞`, 'success')}>📞 Call</button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {currentChat.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[65%] px-3 py-2 rounded-xl text-sm leading-relaxed shadow-sm
                      ${m.from === 'me' ? 'msg-outgoing rounded-br-sm text-foreground' : 'bg-card rounded-bl-sm text-foreground'}`}>
                      {m.text}
                      <div className="text-[10px] text-muted-foreground text-right mt-1">{m.time}{m.from === 'me' ? ' ✓✓' : ''}</div>
                    </div>
                  </div>
                ))}
                <div ref={msgsEndRef} />
              </div>

              {/* Input */}
              <div className="bg-card border-t border-border px-4 py-3 flex items-center gap-2.5">
                <button className="p-2 rounded-md border border-border hover:bg-muted text-sm"
                  onClick={() => showToast('Template picker coming soon!', 'info')}>📝</button>
                <input
                  className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
                  placeholder={t('type_message')}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                />
                <button className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
                  onClick={handleSend}>Send ➤</button>
                <button className="bg-emerald-500 text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:bg-emerald-600 transition flex items-center gap-1"
                  onClick={handleSendViaApi}
                  title={t('wa_api_send')}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                  API
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a chat</div>
          )}
        </div>
      </div>
    </div>
  );
}
