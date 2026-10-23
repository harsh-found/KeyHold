import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Pencil, Trash2, Copy, Check, Eye, EyeOff, ShieldCheck, ExternalLink, StickyNote, Radar,
} from 'lucide-react';
import type { Account } from '../lib/types';
import { methodMeta, verificationMeta } from '../lib/meta';
import { ServiceIcon } from './ServiceIcon';
import { cn, copyText, formatDate, relativeTime } from '../lib/utils';

interface Props {
  account: Account;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (a: Account) => void;
  onDelete: (a: Account) => void;
  onToggleFav: (a: Account) => void;
  notify: (text: string, kind?: 'success' | 'info' | 'error') => void;
  autoMask: boolean;
}

export function AccountCard({ account, index, selected, onSelect, onEdit, onDelete, onToggleFav, notify, autoMask }: Props) {
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const m = methodMeta[account.signInMethod];
  const v = verificationMeta[account.verification];

  const doCopy = async (label: string, value?: string) => {
    if (!value) return;
    const ok = await copyText(value);
    if (ok) {
      setCopied(label);
      notify(`${label} copied`, 'success');
      setTimeout(() => setCopied(null), 1400);
    } else {
      notify('Copy failed', 'error');
    }
  };

  const statusRing =
    account.status === 'active' ? 'var(--brand)' : account.status === 'inactive' ? 'var(--amber)' : 'var(--muted)';

  const masked = autoMask && !showPw;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      className={cn(
        'group relative flex flex-col rounded-2xl border p-5 transition-shadow hover:shadow-[0_14px_40px_-20px_rgba(0,0,0,0.35)]',
        selected ? 'border-brand bg-brandSoft' : 'border-line bg-card',
      )}
    >
      {/* Bulk select checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(account.id)}
        className="absolute left-3 top-3 h-4 w-4 rounded opacity-0 transition-opacity group-hover:opacity-100"
        style={{ opacity: selected ? 1 : undefined }}
      />

      <div className="flex items-start gap-3.5">
        <div className="relative">
          <ServiceIcon account={account} size={46} />
          <span
            className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-card"
            style={{ background: statusRing }}
            title={account.status}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-lg font-semibold leading-tight text-ink">{account.service}</h3>
            {account.url && (
              <a
                href={/^https?:/.test(account.url) ? account.url : `https://${account.url}`}
                target="_blank"
                rel="noreferrer"
                className="text-muted opacity-0 transition-opacity hover:text-brand group-hover:opacity-100"
                title="Open site"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span className="rounded-md bg-panel px-1.5 py-0.5 font-medium text-ink/70">{account.category}</span>
            <span aria-hidden>·</span>
            <span title={formatDate(account.createdAt)}>Added {relativeTime(account.createdAt)}</span>
          </p>
        </div>
        <button
          onClick={() => onToggleFav(account)}
          className={cn('rounded-lg p-1.5 transition-colors', account.favorite ? 'text-amber' : 'text-muted hover:text-amber')}
          title="Favorite"
        >
          <Star className={cn('h-4 w-4', account.favorite && 'fill-current')} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Chip Icon={m.Icon} label={m.short} />
        <Chip Icon={v.Icon} label={v.short} accent />
        {account.twoFactor && <Chip Icon={ShieldCheck} label="2FA" tone="brand" />}
        {account.notes && <Chip Icon={StickyNote} label="Notes" tone="muted" />}
        {account.utmSource && <Chip Icon={Radar} label="Tracked" tone="muted" />}
      </div>

      {account.identifier && (
        <button
          onClick={() => doCopy('Identifier', account.identifier)}
          className="mt-3 flex items-center justify-between rounded-xl border border-line bg-panel/60 px-3 py-2 text-left transition-colors hover:border-brand/40"
        >
          <span className="truncate font-mono text-[13px] text-ink/80">{account.identifier}</span>
          {copied === 'Identifier' ? <Check className="h-3.5 w-3.5 shrink-0 text-brand" /> : <Copy className="h-3.5 w-3.5 shrink-0 text-muted" />}
        </button>
      )}

      {account.savePassword && account.password && (
        <div className="mt-2 flex items-center justify-between rounded-xl border border-line bg-panel/60 px-3 py-2">
          <span className="truncate font-mono text-[13px] text-ink/80">
            {masked ? '•'.repeat(Math.min(account.password.length, 14)) : account.password}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={() => setShowPw((s) => !s)} className="rounded-md p-1 text-muted hover:text-ink" title={showPw ? 'Hide' : 'Reveal'}>
              {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => doCopy('Password', account.password)} className="rounded-md p-1 text-muted hover:text-brand" title="Copy password">
              {copied === 'Password' ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

      {account.notes && <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">{account.notes}</p>}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <div className="flex flex-wrap gap-1">
          {account.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[11px] font-medium text-muted">#{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={() => onEdit(account)} className="rounded-lg p-1.5 text-muted hover:bg-panel hover:text-ink" title="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(account)} className="rounded-lg p-1.5 text-muted hover:bg-rose/10 hover:text-rose" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Chip({
  Icon,
  label,
  accent,
  tone,
}: {
  Icon: typeof Star;
  label: string;
  accent?: boolean;
  tone?: 'brand' | 'muted';
}) {
  const cls =
    tone === 'brand'
      ? 'border-brand/25 bg-brandSoft text-brandDeep'
      : tone === 'muted'
        ? 'border-line bg-panel/70 text-muted'
        : accent
          ? 'border-amber/25 bg-amber/10 text-amber'
          : 'border-line bg-panel/70 text-ink/70';
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold', cls)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
