import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Plus, Settings, Download, Moon, Sun, ArrowRight } from 'lucide-react';
import type { Account } from '../lib/types';
import { ServiceIcon } from './ServiceIcon';
import { cn } from '../lib/utils';

interface Action {
  id: string;
  label: string;
  icon: typeof Plus;
  shortcut?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  dark: boolean;
  onSelectAccount: (a: Account) => void;
  onAction: (id: string) => void;
}

const ACTIONS: Action[] = [
  { id: 'add', label: 'Add new account', icon: Plus },
  { id: 'settings', label: 'Open settings', icon: Settings },
  { id: 'export', label: 'Export backup', icon: Download },
  { id: 'theme', label: 'Toggle dark mode', icon: Moon },
];

export function CommandPalette({ open, onClose, accounts, dark, onSelectAccount, onAction }: Props) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const q = query.trim().toLowerCase();

  const matchedAccounts = useMemo(() => {
    if (!q) return accounts.slice(0, 5);
    return accounts
      .filter((a) => {
        const hay = [a.service, a.identifier, a.category, ...a.tags].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 6);
  }, [accounts, q]);

  const matchedActions = useMemo(() => {
    if (!q) return ACTIONS;
    return ACTIONS.filter((a) => a.label.toLowerCase().includes(q));
  }, [q]);

  const totalItems = matchedAccounts.length + matchedActions.length;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % Math.max(1, totalItems));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + totalItems) % Math.max(1, totalItems));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx < matchedAccounts.length) {
        onSelectAccount(matchedAccounts[activeIdx]);
        onClose();
      } else {
        const actionIdx = activeIdx - matchedAccounts.length;
        if (matchedActions[actionIdx]) {
          onAction(matchedActions[actionIdx].id);
          onClose();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const ThemeIcon = dark ? Sun : Moon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 px-4 pt-[15vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                onKeyDown={onKeyDown}
                placeholder="Search accounts, actions…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/60"
              />
              <kbd className="shrink-0 rounded bg-panel px-1.5 py-0.5 text-[10px] font-bold text-muted">ESC</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
              {matchedAccounts.length > 0 && (
                <>
                  <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted">Accounts</p>
                  {matchedAccounts.map((a, i) => (
                    <button
                      key={a.id}
                      data-active={activeIdx === i}
                      onClick={() => { onSelectAccount(a); onClose(); }}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        activeIdx === i ? 'bg-brand/10 text-ink' : 'text-muted hover:bg-panel',
                      )}
                    >
                      <ServiceIcon account={a} size={28} />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{a.service}</span>
                        <span className="block truncate text-xs text-muted">{a.identifier || a.category}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" style={{ opacity: activeIdx === i ? 1 : 0 }} />
                    </button>
                  ))}
                </>
              )}

              {matchedActions.length > 0 && (
                <>
                  <p className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-muted">Quick Actions</p>
                  {matchedActions.map((a, i) => {
                    const idx = matchedAccounts.length + i;
                    const Icon = a.id === 'theme' ? ThemeIcon : a.icon;
                    return (
                      <button
                        key={a.id}
                        data-active={activeIdx === idx}
                        onClick={() => { onAction(a.id); onClose(); }}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                          activeIdx === idx ? 'bg-brand/10 text-ink' : 'text-muted hover:bg-panel',
                        )}
                      >
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-panel">
                          <Icon className="h-4 w-4 text-brand" />
                        </div>
                        <span className="text-sm font-medium text-ink">{a.label}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {totalItems === 0 && (
                <p className="py-8 text-center text-sm text-muted">No results found</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
