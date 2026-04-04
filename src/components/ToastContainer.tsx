import { useApp } from '@/context/AppContext';

export default function ToastContainer() {
  const { toasts } = useApp();
  const borderColors: Record<string, string> = {
    info: 'border-l-brand-500',
    success: 'border-l-emerald-500',
    warning: 'border-l-amber-500',
    error: 'border-l-red-500',
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id}
          className={`bg-card border border-border border-l-4 ${borderColors[toast.type]} rounded-lg px-4 py-3 shadow-lg text-sm font-medium text-foreground min-w-[280px] toast-animate`}>
          {toast.msg}
        </div>
      ))}
    </div>
  );
}
