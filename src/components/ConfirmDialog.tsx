import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[75] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm rounded-2xl border border-line bg-card p-6 text-center shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose/10">
              <Trash2 className="h-6 w-6 text-rose" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm text-muted">{message}</p>
            <div className="mt-5 flex gap-2">
              <button onClick={onCancel} className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-panel">Cancel</button>
              <button onClick={onConfirm} className="flex-1 rounded-xl bg-rose px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
