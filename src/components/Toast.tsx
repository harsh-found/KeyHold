import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Info, AlertTriangle } from 'lucide-react';

export interface ToastMsg {
  id: number;
  text: string;
  kind: 'success' | 'info' | 'error';
}

export function Toaster({ toasts, dismiss }: { toasts: ToastMsg[]; dismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} dismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, dismiss }: { toast: ToastMsg; dismiss: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), 2600);
    return () => clearTimeout(t);
  }, [toast.id, dismiss]);
  const Icon = toast.kind === 'success' ? Check : toast.kind === 'error' ? AlertTriangle : Info;
  const color = toast.kind === 'success' ? 'var(--brand)' : toast.kind === 'error' ? 'var(--rose)' : 'var(--amber)';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2.5 shadow-lg shadow-black/5"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: color }}>
        <Icon className="h-3 w-3 text-white" strokeWidth={3} />
      </span>
      <span className="text-sm font-medium text-ink">{toast.text}</span>
    </motion.div>
  );
}
