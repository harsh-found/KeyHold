import { motion } from 'framer-motion';
import { Star, Pencil, Trash2, ShieldCheck, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Account } from '../lib/types';
import { methodMeta, verificationMeta } from '../lib/meta';
import { ServiceIcon } from './ServiceIcon';
import { cn, copyText, relativeTime } from '../lib/utils';

interface Props {
  account: Account;
  index: number;
  compact: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (a: Account) => void;
  onDelete: (a: Account) => void;
  onToggleFav: (a: Account) => void;
  notify: (text: string, kind?: 'success' | 'info' | 'error') => void;
}

export function AccountListItem({ account, index, compact, selected, onSelect, onEdit, onDelete, onToggleFav, notify }: Props) {
  const [copied, setCopied] = useState(false);
  const m = methodMeta[account.signInMethod];
  const v = verificationMeta[account.verification];
  const statusColor = account.status === 'active' ? 'var(--brand)' : account.status === 'inactive' ? 'var(--amber)' : 'var(--muted)';

  const doCopy = async () => {
    if (!account.identifier) return;
    const ok = await copyText(account.identifier);
    if (ok) { setCopied(true); notify('Copied', 'success'); setTimeout(() => setCopied(false), 1400); }
  };

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.15) }}
        className={cn(
          'group flex items-center gap-2.5 rounded-xl border px-3 py-1.5 transition-all',
          selected ? 'border-brand bg-brandSoft' : 'border-line bg-card hover:shadow-md',
        )}
      >
        <input type="checkbox" checked={selected} onChange={() => onSelect(account.id)} className="h-3.5 w-3.5 shrink-0 rounded" />
        <ServiceIcon account={account} size={24} />
        <span className="min-w-[80px] truncate text-sm font-semibold text-ink">{account.service}</span>
        <span className="hidden truncate text-xs text-muted sm:block">{account.identifier || '—'}</span>
        <span className="hidden text-[11px] text-muted/70 md:block">{m.short}</span>
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: statusColor }} />
        <span className="hidden text-[11px] text-muted lg:block">{relativeTime(account.createdAt)}</span>
        <div className="ml-auto flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {account.identifier && (
            <button onClick={doCopy} className="p-1 text-muted hover:text-brand" title="Copy">
              {copied ? <Check className="h-3 w-3 text-brand" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
          <button onClick={() => onToggleFav(account)} className={cn('p-1', account.favorite ? 'text-amber' : 'text-muted hover:text-amber')} title="Favorite">
            <Star className={cn('h-3 w-3', account.favorite && 'fill-current')} />
          </button>
          <button onClick={() => onEdit(account)} className="p-1 text-muted hover:text-ink" title="Edit"><Pencil className="h-3 w-3" /></button>
          <button onClick={() => onDelete(account)} className="p-1 text-muted hover:text-rose" title="Delete"><Trash2 className="h-3 w-3" /></button>
        </div>
      </motion.div>
    );
  }

  /* ── Full list row ── */
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.025, 0.2) }}
      className={cn(
        'group flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all',
        selected ? 'border-brand bg-brandSoft' : 'border-line bg-card hover:shadow-lg',
      )}
    >
      <input type="checkbox" checked={selected} onChange={() => onSelect(account.id)} className="h-4 w-4 shrink-0 rounded" />
      <div className="relative">
        <ServiceIcon account={account} size={38} />
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card" style={{ background: statusColor }} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display text-[15px] font-semibold text-ink">{account.service}</h3>
          <span className="hidden rounded-md bg-panel px-1.5 py-0.5 text-[10px] font-medium text-ink/70 sm:inline">{account.category}</span>
          {account.twoFactor && <ShieldCheck className="hidden h-3.5 w-3.5 text-brand sm:block" />}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
          <span className="truncate">{account.identifier || '—'}</span>
          <span className="text-muted/40">·</span>
          <span className="hidden sm:inline">{m.short} · {v.short}</span>
          <span className="hidden text-muted/40 sm:inline">·</span>
          <span>{relativeTime(account.createdAt)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {account.identifier && (
          <button onClick={doCopy} className="rounded-lg p-1.5 text-muted hover:bg-panel hover:text-brand" title="Copy identifier">
            {copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
        <button onClick={() => onToggleFav(account)} className={cn('rounded-lg p-1.5', account.favorite ? 'text-amber' : 'text-muted hover:text-amber')} title="Favorite">
          <Star className={cn('h-4 w-4', account.favorite && 'fill-current')} />
        </button>
        <button onClick={() => onEdit(account)} className="rounded-lg p-1.5 text-muted hover:bg-panel hover:text-ink" title="Edit">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={() => onDelete(account)} className="rounded-lg p-1.5 text-muted hover:bg-rose/10 hover:text-rose" title="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
