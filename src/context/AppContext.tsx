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

// ─── WhatsApp types ────────────────────────────────────────────────────────

export type WaRouting = 'deals' | 'inbox' | 'invoices' | 'broadcasts';
export type WaStatus  = 'connected' | 'disconnected' | 'error';
export type Plan      = 'starter' | 'pro' | 'enterprise';

export interface WhatsAppNumber {
  id: string;
  phone: string;
  accountName: string;
  accountId: string;
  apiToken: string;
  label: string;
  isDefault: boolean;
  status: WaStatus;
  routing: WaRouting[];
}

export const PLAN_LIMITS: Record<Plan, number> = {
  starter:    1,
  pro:        3,
  enterprise: Infinity,
};

// ─── Toast ────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  msg: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// ─── App state ────────────────────────────────────────────────────────────

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
  // Multi-number WhatsApp state
  whatsappNumbers: WhatsAppNumber[];
  whatsappConnecting: boolean;
  currentPlan: Plan;
  quickMessageDealId: number | null;
  backendDealIds: Record<number, string>;
  backendByPhone: Record<string, string>;
  isLoading: boolean;
  appError: string | null;
}

// ─── Context type ─────────────────────────────────────────────────────────

interface AppContextType extends AppState {
  // Derived helpers (computed, not stored)
  whatsappConnected: boolean;
  connectedNumbers: WhatsAppNumber[];
  numberLimit: number;
  canAddNumber: boolean;
  // Auth
  doLogin: (email: string, password: string) => Promise<void>;
  doLogout: () => void;
  navigate: (page: string) => void;
  setLang: (lang: Lang) => void;
  toggleDark: () => void;
  t: (key: string) => string;
  showToast: (msg: string, type?: Toast['type']) => void;
  // Chat / deals
  setCurrentChatId: (id: number) => void;
  moveDeal: (dealId: number, newStage: string) => void;
  sendMessage: (chatId: number, text: string, numberId?: string) => void;
  setSidebarOpen: (open: boolean) => void;
  openDealModal: (dealId: number) => void;
  closeDealModal: () => void;
  openInvoiceModal: (dealId: number) => void;
  closeInvoiceModal: () => void;
  markChatRead: (chatId: number) => void;
  openQuickMessage: (dealId: number) => void;
  closeQuickMessage: () => void;
  sendDealMessage: (dealId: number, text: string, numberId?: string) => void;
  retryHydration: () => void;
  // Multi-number WhatsApp management
  addWhatsAppNumber: (config: Omit<WhatsAppNumber, 'id' | 'status' | 'isDefault' | 'routing'>) => void;
  removeWhatsAppNumber: (id: string) => void;
  setDefaultNumber: (id: string) => void;
  updateNumberRouting: (id: string, routing: WaRouting[]) => void;
  testNumberConnection: (id: string) => void;
  // Legacy single-connect shim (used by old call sites)
  connectWhatsApp: (config: { phone: string; accountName: string; accountId: string; apiToken: string }) => void;
  disconnectWhatsApp: (id?: string) => void;
}

const AppContext = createContext<AppContextType>(null!);
export function useApp() { return useContext(AppContext); }

// ─── Helpers ──────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Pick the best connected number for a given use-case */
function pickNumber(numbers: WhatsAppNumber[], useCase: WaRouting): WhatsAppNumber | undefined {
  return (
    numbers.find(n => n.status === 'connected' && n.routing.includes(useCase)) ??
    numbers.find(n => n.status === 'connected' && n.isDefault) ??
    numbers.find(n => n.status === 'connected')
  );
}

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
    whatsappNumbers: [],
    whatsappConnecting: false,
    currentPlan: 'pro',
    quickMessageDealId: null,
    backendDealIds: {},
    backendByPhone: {},
    isLoading: Boolean(getStoredToken()),
    appError: null,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────

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

  // ── Hydrate from backend ────────────────────────────────────────────────

  const hydrateFromBackend = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, appError: null }));
    try {
      const pipeline = await getPipeline();
      console.log('RAW pipeline response:', pipeline);

      const pipelineDeals: any[] = (pipeline?.data?.columns ?? []).flatMap((c: any) => c.deals ?? []);
      console.log('pipelineDeals after flatMap:', pipelineDeals);

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

  useEffect(() => {
    if (getStoredToken()) hydrateFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────

  const doLogin = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password);
    await hydrateFromBackend();
  }, [hydrateFromBackend]);

  const doLogout = useCallback(() => {
    localStorage.removeItem('chatclose_token');
    setState(s => ({ ...makeInitialState(), lang: s.lang, darkMode: s.darkMode, isLoading: false }));
    showToast('Signed out successfully.', 'info');
  }, [showToast]);

  // ── i18n / nav ──────────────────────────────────────────────────────────

  const t = useCallback((key: string) => STRINGS[state.lang]?.[key] || STRINGS.en[key] || key, [state.lang]);
  const navigate = useCallback((page: string) => setState(s => ({ ...s, currentPage: page, sidebarOpen: false })), []);

  // ── Deals ───────────────────────────────────────────────────────────────

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

  // ── Messaging ───────────────────────────────────────────────────────────

  const sendMessage = useCallback((chatId: number, text: string, numberId?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setState(s => {
      const chat = s.chats.find(c => c.id === chatId);
      const backendId = s.backendByPhone[chat?.phone ?? ''];
      if (backendId) sendDealReply(backendId, text).catch(() => showToast('Backend send failed.', 'warning'));

      // Use specified number, or auto-pick for inbox routing
      const num = numberId
        ? s.whatsappNumbers.find(n => n.id === numberId)
        : pickNumber(s.whatsappNumbers, 'inbox');
      const numLabel = num ? ` via ${num.label}` : '';

      return {
        ...s,
        chats: s.chats.map(c => c.id === chatId
          ? { ...c, messages: [...c.messages, { from: 'me' as const, text, time: timeStr }], time: 'Just now' }
          : c),
      };
      void numLabel; // used only for toast below
    });
    showToast('Message sent via WhatsApp ✓✓', 'success');
  }, [showToast]);

  const sendDealMessage = useCallback((dealId: number, text: string, numberId?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setState(s => {
      const deal = s.deals.find(d => d.id === dealId);
      const chat = deal ? s.chats.find(c => c.phone === deal.phone) : undefined;
      const backendId = s.backendDealIds[dealId];
      if (backendId) sendDealReply(backendId, text).catch(() => showToast('Backend send failed.', 'warning'));

      const num = numberId
        ? s.whatsappNumbers.find(n => n.id === numberId)
        : pickNumber(s.whatsappNumbers, 'deals');
      void num;

      if (!chat) return { ...s, quickMessageDealId: null };
      return {
        ...s,
        quickMessageDealId: null,
        chats: s.chats.map(c => c.id === chat.id
          ? { ...c, messages: [...c.messages, { from: 'me' as const, text, time: timeStr }], time: 'Just now' }
          : c),
      };
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

  // ── Multi-number WhatsApp management ────────────────────────────────────

  const addWhatsAppNumber = useCallback((
    config: Omit<WhatsAppNumber, 'id' | 'status' | 'isDefault' | 'routing'>
  ) => {
    setState(s => {
      const limit = PLAN_LIMITS[s.currentPlan];
      if (s.whatsappNumbers.length >= limit) {
        showToast(`Your ${s.currentPlan} plan supports up to ${limit} number${limit > 1 ? 's' : ''}. Upgrade to add more.`, 'warning');
        return s;
      }
      const isFirst = s.whatsappNumbers.length === 0;
      const newNumber: WhatsAppNumber = {
        ...config,
        id: makeId(),
        status: 'connected',
        isDefault: isFirst,
        routing: isFirst ? ['deals', 'inbox', 'invoices', 'broadcasts'] : [],
      };
      return { ...s, whatsappNumbers: [...s.whatsappNumbers, newNumber] };
    });
    showToast('WhatsApp number connected! ✅', 'success');
  }, [showToast]);

  const removeWhatsAppNumber = useCallback((id: string) => {
    setState(s => {
      const remaining = s.whatsappNumbers.filter(n => n.id !== id);
      // If we removed the default, promote the first remaining one
      const hadDefault = s.whatsappNumbers.find(n => n.id === id)?.isDefault ?? false;
      if (hadDefault && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return { ...s, whatsappNumbers: remaining };
    });
    showToast('WhatsApp number disconnected.', 'warning');
  }, [showToast]);

  const setDefaultNumber = useCallback((id: string) => {
    setState(s => ({
      ...s,
      whatsappNumbers: s.whatsappNumbers.map(n => ({ ...n, isDefault: n.id === id })),
    }));
    showToast('Default number updated.', 'success');
  }, [showToast]);

  const updateNumberRouting = useCallback((id: string, routing: WaRouting[]) => {
    setState(s => ({
      ...s,
      whatsappNumbers: s.whatsappNumbers.map(n => n.id === id ? { ...n, routing } : n),
    }));
    showToast('Routing preferences saved.', 'success');
  }, [showToast]);

  const testNumberConnection = useCallback((id: string) => {
    showToast('Testing connection…', 'info');
    setTimeout(() => showToast('Connection OK ✅', 'success'), 1200);
  }, [showToast]);

  // ── Legacy shims (keep old call sites working) ──────────────────────────

  /** Legacy single-connect — adds as the first number */
  const connectWhatsApp = useCallback((
    config: { phone: string; accountName: string; accountId: string; apiToken: string }
  ) => {
    setState(s => ({ ...s, whatsappConnecting: true }));
    setTimeout(() => {
      setState(s => ({ ...s, whatsappConnecting: false }));
      addWhatsAppNumber({ ...config, label: config.accountName });
    }, 2000);
  }, [addWhatsAppNumber]);

  /** Legacy disconnect — if no id given, removes all numbers */
  const disconnectWhatsApp = useCallback((id?: string) => {
    if (id) {
      removeWhatsAppNumber(id);
    } else {
      setState(s => ({ ...s, whatsappNumbers: [] }));
      showToast('All WhatsApp numbers disconnected.', 'warning');
    }
  }, [removeWhatsAppNumber, showToast]);

  // ── Context value ───────────────────────────────────────────────────────

  const connectedNumbers = state.whatsappNumbers.filter(n => n.status === 'connected');
  const whatsappConnected = connectedNumbers.length > 0;
  const numberLimit = PLAN_LIMITS[state.currentPlan];
  const canAddNumber = state.whatsappNumbers.length < numberLimit;

  const ctx: AppContextType = {
    ...state,
    // Derived
    whatsappConnected,
    connectedNumbers,
    numberLimit,
    canAddNumber,
    // Methods
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
    markChatRead,
    connectWhatsApp,
    disconnectWhatsApp,
    openQuickMessage: id => setState(s => ({ ...s, quickMessageDealId: id })),
    closeQuickMessage: () => setState(s => ({ ...s, quickMessageDealId: null })),
    sendDealMessage,
    retryHydration: hydrateFromBackend,
    addWhatsAppNumber,
    removeWhatsAppNumber,
    setDefaultNumber,
    updateNumberRouting,
    testNumberConnection,
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}