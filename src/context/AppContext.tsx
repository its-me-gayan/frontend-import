import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { Lang, STRINGS } from '@/data/i18n';
import { type Deal, type Chat } from '@/data/mockData';
import {
  backendStageToUi,
  getInbox,
  getPipeline,
  getStoredToken,
  login as apiLogin,
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
  isAuthenticated: boolean;
  currentPage: string;
  lang: Lang;
  darkMode: boolean;
  deals: Deal[];
  chats: Chat[];
  currentChatId: number | null;
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
  isLoading: boolean;
  appError: string | null;
}

interface AppContextType extends AppState {
  doLogin: (email: string, password: string) => Promise<void>;
  doLogout: () => void;
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
  retryHydration: () => void;
}

const AppContext = createContext<AppContextType>(null!);
export function useApp() { return useContext(AppContext); }

const EMPTY_WA = { phone: '', accountName: '', accountId: '', apiToken: '' };

function makeInitialState(): AppState {
  return {
    isAuthenticated: false,
    currentPage: 'dashboard',
    lang: 'en',
    darkMode: localStorage.getItem('theme') === 'dark',
    deals: [],
    chats: [],
    currentChatId: null,
    toasts: [],
    sidebarOpen: false,
    dealModalId: null,
    invoiceModalDealId: null,
    whatsappConnected: false,
    whatsappConnecting: false,
    whatsappConfig: EMPTY_WA,
    quickMessageDealId: null,
    backendDealIds: {},
    backendByPhone: {},
    // Show spinner immediately if a token already exists
    isLoading: Boolean(getStoredToken()),
    appError: null,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(makeInitialState);
  const toastIdRef = useRef(0);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
    localStorage.setItem('theme', state.darkMode ? 'dark' : 'light');
  }, [state.darkMode]);

  // Toast
  const showToast = useCallback((msg: string, type: Toast['type'] = 'info') => {
    const id = ++toastIdRef.current;
    setState(s => ({ ...s, toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  }, []);

  // Hydrate workspace from backend
  const hydrateFromBackend = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, appError: null }));
    try {
      const pipeline = await getPipeline();
      console.log('RAW pipeline response:', pipeline); // 👈 add this

      const pipelineDeals: any[] = (pipeline?.data?.columns ?? []).flatMap((c: any) => c.deals ?? []);
console.log('pipelineDeals after flatMap:', pipelineDeals); // 👈 and this

      
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
      const inboxDeals: any[] = inbox?.data?.content ?? [];

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
          messages: [{ from: 'them' as const, text: d?.description ?? d?.title ?? 'Conversation started.', time: '—' }],
        };
      });

      setState(s => ({
        ...s, deals, chats,
        currentChatId: chats[0]?.id ?? null,
        backendDealIds, backendByPhone,
        isLoading: false, isAuthenticated: true, appError: null,
      }));
    } catch (e: any) {
      const is401 = e?.message?.includes('401') || e?.message?.toLowerCase().includes('unauthorized');
      if (is401) {
        localStorage.removeItem('chatclose_token');
        setState(s => ({ ...s, isLoading: false, isAuthenticated: false, appError: null }));
      } else {
        setState(s => ({
          ...s, isLoading: false,
          appError: e?.message?.startsWith('API ') ? e.message : 'Could not reach the server. Check your connection.',
        }));
      }
    }
  }, []);

  // Auto-hydrate on mount if token exists
  useEffect(() => {
    if (getStoredToken()) hydrateFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogin = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password); // stores token in localStorage
    await hydrateFromBackend();
  }, [hydrateFromBackend]);

  const doLogout = useCallback(() => {
    localStorage.removeItem('chatclose_token');
    setState(s => ({ ...makeInitialState(), lang: s.lang, darkMode: s.darkMode, isLoading: false }));
    showToast('Signed out successfully.', 'info');
  }, [showToast]);

  const t = useCallback((key: string) => STRINGS[state.lang]?.[key] || STRINGS.en[key] || key, [state.lang]);
  const navigate = useCallback((page: string) => setState(s => ({ ...s, currentPage: page, sidebarOpen: false })), []);

  const moveDeal = useCallback((dealId: number, newStage: string) => {
    setState(s => ({ ...s, deals: s.deals.map(d => d.id === dealId ? { ...d, stage: newStage } : d) }));
    const labels: Record<string, string> = { new: 'New Leads', quoted: 'Quoted', negotiation: 'Negotiation', won: 'Won 🏆', lost: 'Lost' };
    showToast(`✅ Deal moved to ${labels[newStage] ?? newStage}`, 'success');
    setState(s => {
      const backendId = s.backendDealIds[dealId];
      if (backendId) moveDealStage(backendId, newStage as any).catch(() => showToast('Failed to sync stage move.', 'error'));
      return s;
    });
  }, [showToast]);

  const sendMessage = useCallback((chatId: number, text: string) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setState(s => {
      const backendId = s.backendByPhone[s.chats.find(c => c.id === chatId)?.phone ?? ''];
      if (backendId) sendDealReply(backendId, text).catch(() => showToast('Backend send failed.', 'warning'));
      return { ...s, chats: s.chats.map(c => c.id === chatId ? { ...c, messages: [...c.messages, { from: 'me' as const, text, time: timeStr }], time: 'Just now' } : c) };
    });
    showToast('Message sent via WhatsApp ✓✓', 'success');
  }, [showToast]);

  const markChatRead = useCallback((chatId: number) => {
    setState(s => {
      const backendId = s.backendByPhone[s.chats.find(c => c.id === chatId)?.phone ?? ''];
      if (backendId) markDealRead(backendId).catch(() => showToast('Could not mark as read.', 'warning'));
      return { ...s, chats: s.chats.map(c => c.id === chatId ? { ...c, unread: 0 } : c) };
    });
  }, [showToast]);

  const connectWhatsApp = useCallback((config: AppState['whatsappConfig']) => {
    setState(s => ({ ...s, whatsappConnecting: true }));
    setTimeout(() => {
      setState(s => ({ ...s, whatsappConnected: true, whatsappConnecting: false, whatsappConfig: config }));
      showToast('WhatsApp Business API connected! ✅', 'success');
    }, 2000);
  }, [showToast]);

  const disconnectWhatsApp = useCallback(() => {
    setState(s => ({ ...s, whatsappConnected: false, whatsappConfig: EMPTY_WA }));
    showToast('WhatsApp disconnected', 'warning');
  }, [showToast]);

  const sendDealMessage = useCallback((dealId: number, text: string) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setState(s => {
      const deal = s.deals.find(d => d.id === dealId);
      const chat = deal ? s.chats.find(c => c.phone === deal.phone) : undefined;
      const backendId = s.backendDealIds[dealId];
      if (backendId) sendDealReply(backendId, text).catch(() => showToast('Backend send failed.', 'warning'));
      if (!chat) return { ...s, quickMessageDealId: null };
      return { ...s, quickMessageDealId: null, chats: s.chats.map(c => c.id === chat.id ? { ...c, messages: [...c.messages, { from: 'me' as const, text, time: timeStr }], time: 'Just now' } : c) };
    });
    showToast('Message sent via WhatsApp ✓✓', 'success');
  }, [showToast]);

  const ctx: AppContextType = {
    ...state,
    doLogin, doLogout, navigate,
    setLang: lang => setState(s => ({ ...s, lang })),
    toggleDark: () => setState(s => ({ ...s, darkMode: !s.darkMode })),
    t, showToast,
    setCurrentChatId: id => setState(s => ({ ...s, currentChatId: id })),
    moveDeal, sendMessage,
    setSidebarOpen: open => setState(s => ({ ...s, sidebarOpen: open })),
    openDealModal: id => setState(s => ({ ...s, dealModalId: id })),
    closeDealModal: () => setState(s => ({ ...s, dealModalId: null })),
    openInvoiceModal: id => setState(s => ({ ...s, invoiceModalDealId: id, dealModalId: null })),
    closeInvoiceModal: () => setState(s => ({ ...s, invoiceModalDealId: null })),
    markChatRead, connectWhatsApp, disconnectWhatsApp,
    openQuickMessage: id => setState(s => ({ ...s, quickMessageDealId: id })),
    closeQuickMessage: () => setState(s => ({ ...s, quickMessageDealId: null })),
    sendDealMessage,
    retryHydration: hydrateFromBackend,
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}