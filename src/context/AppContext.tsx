import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Lang, STRINGS } from '@/data/i18n';
import { DEALS as INITIAL_DEALS, CHATS as INITIAL_CHATS, FAKE_MESSAGES, type Deal, type Chat } from '@/data/mockData';
import {
  backendStageToUi,
  getInbox,
  getPipeline,
  getStoredToken,
  markDealRead,
  moveDealStage,
  sendDealReply,
} from '@/lib/api';

interface Toast {
  id: number;
  msg: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppState {
  currentPage: string;
  lang: Lang;
  darkMode: boolean;
  deals: Deal[];
  chats: Chat[];
  currentChatId: number;
  toasts: Toast[];
  sidebarOpen: boolean;
  dealModalId: number | null;
  invoiceModalDealId: number | null;
  whatsappConnected: boolean;
  whatsappConnecting: boolean;
  whatsappConfig: { phone: string; accountName: string; accountId: string; apiToken: string };
  quickMessageDealId: number | null;
  backendDealIds: Record<number, string>;
  backendByPhone: Record<string, string>;
}

interface AppContextType extends AppState {
  navigate: (page: string) => void;
  setLang: (lang: Lang) => void;
  toggleDark: () => void;
  t: (key: string) => string;
  showToast: (msg: string, type?: Toast['type']) => void;
  setCurrentChatId: (id: number) => void;
  moveDeal: (dealId: number, newStage: string) => void;
  sendMessage: (chatId: number, text: string) => void;
  setSidebarOpen: (open: boolean) => void;
  openDealModal: (dealId: number) => void;
  closeDealModal: () => void;
  openInvoiceModal: (dealId: number) => void;
  closeInvoiceModal: () => void;
  markChatRead: (chatId: number) => void;
  connectWhatsApp: (config: AppState['whatsappConfig']) => void;
  disconnectWhatsApp: () => void;
  openQuickMessage: (dealId: number) => void;
  closeQuickMessage: () => void;
  sendDealMessage: (dealId: number, text: string) => void;
}

const AppContext = createContext<AppContextType>(null!);

export function useApp() { return useContext(AppContext); }

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentPage: 'dashboard',
    lang: 'en',
    darkMode: localStorage.getItem('theme') === 'dark',
    deals: [...INITIAL_DEALS],
    chats: INITIAL_CHATS.map(c => ({ ...c, messages: [...c.messages] })),
    currentChatId: 1,
    toasts: [],
    sidebarOpen: false,
    dealModalId: null,
    invoiceModalDealId: null,
    whatsappConnected: false,
    whatsappConnecting: false,
    whatsappConfig: { phone: '', accountName: '', accountId: '', apiToken: '' },
    quickMessageDealId: null,
    backendDealIds: {},
    backendByPhone: {},
  });

  const toastIdRef = useRef(0);
  const fakeIdxRef = useRef(0);

  // Dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
    localStorage.setItem('theme', state.darkMode ? 'dark' : 'light');
  }, [state.darkMode]);

  const showToast = useCallback((msg: string, type: Toast['type'] = 'info') => {
    const id = ++toastIdRef.current;
    setState(s => ({ ...s, toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => {
      setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
    }, 3500);
  }, []);

  const hydrateFromBackend = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const pipeline = await getPipeline();
      const pipelineDeals = (pipeline?.data?.columns ?? []).flatMap((c: any) => c.deals ?? []);

      const backendDealIds: Record<number, string> = {};
      const backendByPhone: Record<string, string> = {};

      const deals: Deal[] = pipelineDeals.map((d: any, idx: number) => {
        const uiId = idx + 1;
        const phone = d?.contact?.whatsAppPhone ?? `+94 70 000 ${String(uiId).padStart(4, '0')}`;
        backendDealIds[uiId] = d.id;
        backendByPhone[phone] = d.id;

        return {
          id: uiId,
          name: d?.contact?.fullName ?? d?.title ?? `Lead ${uiId}`,
          phone,
          company: d?.contact?.company ?? 'Customer',
          value: Number(d?.valueLkr ?? 0),
          stage: backendStageToUi(d?.stage),
          prob: Number(d?.probability ?? 10),
          dueDate: d?.closeDate ?? new Date().toISOString().slice(0, 10),
          lastMsg: d?.description ?? 'No message yet.',
          tag: (d?.tags ?? '').split(',')[0] || 'General',
          city: d?.contact?.city ?? 'Sri Lanka',
          notes: d?.notes ?? '',
          assignee: d?.assignedUser?.fullName ?? 'Unassigned',
          product: d?.title ?? 'Service',
        };
      });

      const inbox = await getInbox();
      const inboxDeals = inbox?.data?.content ?? [];
      const chats: Chat[] = inboxDeals.map((d: any, idx: number) => {
        const phone = d?.contact?.whatsAppPhone ?? `+94 70 111 ${String(idx + 1).padStart(4, '0')}`;
        const mappedUiId = deals.find(x => x.phone === phone)?.id ?? idx + 1;
        if (!backendDealIds[mappedUiId]) backendDealIds[mappedUiId] = d.id;
        backendByPhone[phone] = d.id;

        return {
          id: mappedUiId,
          name: d?.contact?.fullName ?? d?.title ?? `Chat ${idx + 1}`,
          phone,
          color: '#0f6fbd',
          unread: Number(d?.unreadCount ?? 0),
          time: d?.lastMessageAt ? 'Just now' : '—',
          messages: [
            {
              from: 'them',
              text: d?.description ?? d?.title ?? 'Conversation started.',
              time: '—',
            },
          ],
        };
      });

      setState(s => ({
        ...s,
        deals: deals.length ? deals : s.deals,
        chats: chats.length ? chats : s.chats,
        currentChatId: chats[0]?.id ?? s.currentChatId,
        backendDealIds,
        backendByPhone,
      }));
    } catch (e) {
      console.warn('Backend sync failed, using local mock data.', e);
      showToast('Running in offline/mock mode.', 'warning');
    }
  }, [showToast]);

  const t = useCallback((key: string) => {
    return STRINGS[state.lang]?.[key] || STRINGS.en[key] || key;
  }, [state.lang]);

  const navigate = useCallback((page: string) => {
    setState(s => ({ ...s, currentPage: page, sidebarOpen: false }));
  }, []);

  useEffect(() => {
    hydrateFromBackend();
  }, [hydrateFromBackend]);

  const moveDeal = useCallback((dealId: number, newStage: string) => {
    setState(s => {
      const deals = s.deals.map(d => d.id === dealId ? { ...d, stage: newStage } : d);
      return { ...s, deals };
    });
    const stageLabels: Record<string, string> = { new: 'New Leads', quoted: 'Quoted', negotiation: 'Negotiation', won: 'Won 🏆', lost: 'Lost' };
    showToast(`✅ Deal moved to ${stageLabels[newStage]}`, 'success');

    const backendId = state.backendDealIds[dealId];
    if (backendId) {
      moveDealStage(backendId, newStage as any).catch(() => {
        showToast('Failed to sync stage move to backend.', 'error');
      });
    }
  }, [showToast, state.backendDealIds]);

  const sendMessage = useCallback((chatId: number, text: string) => {
    const now = new Date();
    const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    setState(s => ({
      ...s,
      chats: s.chats.map(c =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, { from: 'me' as const, text, time: timeStr }], time: 'Just now' }
          : c
      ),
    }));
    showToast('Message sent via WhatsApp ✓✓', 'success');

    const chat = state.chats.find(c => c.id === chatId);
    const backendId = chat ? state.backendByPhone[chat.phone] : undefined;
    if (backendId) {
      sendDealReply(backendId, text).catch(() => {
        showToast('Backend send failed (message kept locally).', 'warning');
      });
    }
  }, [showToast, state.chats, state.backendByPhone]);

  const markChatRead = useCallback((chatId: number) => {
    setState(s => ({
      ...s,
      chats: s.chats.map(c => c.id === chatId ? { ...c, unread: 0 } : c),
    }));

    const chat = state.chats.find(c => c.id === chatId);
    const backendId = chat ? state.backendByPhone[chat.phone] : undefined;
    if (backendId) {
      markDealRead(backendId).catch(() => {
        showToast('Could not mark as read on backend.', 'warning');
      });
    }
  }, [state.chats, state.backendByPhone, showToast]);

  // Live simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const fake = FAKE_MESSAGES[fakeIdxRef.current % FAKE_MESSAGES.length];
      fakeIdxRef.current++;
      const now = new Date();
      const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');

      setState(s => {
        const chats = s.chats.map(c =>
          c.id === fake.chatId
            ? { ...c, messages: [...c.messages, { from: 'them' as const, text: fake.text, time: timeStr }], unread: c.unread + 1, time: 'Just now' }
            : c
        );
        return { ...s, chats };
      });

      const chat = INITIAL_CHATS.find(c => c.id === fake.chatId);
      if (chat) {
        showToast(`📱 ${chat.name}: "${fake.text.slice(0, 45)}..."`, 'success');
      }
    }, 25000 + Math.random() * 10000);

    return () => clearInterval(interval);
  }, [showToast]);

  const connectWhatsApp = useCallback((config: AppState['whatsappConfig']) => {
    setState(s => ({ ...s, whatsappConnecting: true }));
    // Simulate API connection
    setTimeout(() => {
      setState(s => ({ ...s, whatsappConnected: true, whatsappConnecting: false, whatsappConfig: config }));
      showToast('WhatsApp Business API connected successfully! ✅', 'success');
    }, 2000);
  }, [showToast]);

  const disconnectWhatsApp = useCallback(() => {
    setState(s => ({
      ...s,
      whatsappConnected: false,
      whatsappConfig: { phone: '', accountName: '', accountId: '', apiToken: '' },
    }));
    showToast('WhatsApp disconnected', 'warning');
  }, [showToast]);

  const sendDealMessage = useCallback((dealId: number, text: string) => {
    setState(s => {
      const deal = s.deals.find(d => d.id === dealId);
      if (!deal) return s;
      const chat = s.chats.find(c => c.phone === deal.phone);
      const now = new Date();
      const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
      if (chat) {
        return {
          ...s,
          chats: s.chats.map(c =>
            c.id === chat.id
              ? { ...c, messages: [...c.messages, { from: 'me' as const, text, time: timeStr }], time: 'Just now' }
              : c
          ),
          quickMessageDealId: null,
        };
      }
      return { ...s, quickMessageDealId: null };
    });
    showToast('Message sent via WhatsApp Business API ✓✓', 'success');

    const backendId = state.backendDealIds[dealId];
    if (backendId) {
      sendDealReply(backendId, text).catch(() => {
        showToast('Backend send failed (message kept locally).', 'warning');
      });
    }
  }, [showToast, state.backendDealIds]);

  const ctx: AppContextType = {
    ...state,
    navigate,
    setLang: (lang) => setState(s => ({ ...s, lang })),
    toggleDark: () => setState(s => ({ ...s, darkMode: !s.darkMode })),
    t,
    showToast,
    setCurrentChatId: (id) => setState(s => ({ ...s, currentChatId: id })),
    moveDeal,
    sendMessage,
    setSidebarOpen: (open) => setState(s => ({ ...s, sidebarOpen: open })),
    openDealModal: (dealId) => setState(s => ({ ...s, dealModalId: dealId })),
    closeDealModal: () => setState(s => ({ ...s, dealModalId: null })),
    openInvoiceModal: (dealId) => setState(s => ({ ...s, invoiceModalDealId: dealId, dealModalId: null })),
    closeInvoiceModal: () => setState(s => ({ ...s, invoiceModalDealId: null })),
    markChatRead,
    connectWhatsApp,
    disconnectWhatsApp,
    openQuickMessage: (dealId) => setState(s => ({ ...s, quickMessageDealId: dealId })),
    closeQuickMessage: () => setState(s => ({ ...s, quickMessageDealId: null })),
    sendDealMessage,
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}
