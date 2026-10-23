import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Search, Moon, Sun, Download, Upload, X, SlidersHorizontal, KeyRound, ArrowDownWideNarrow,
  Settings as GearIcon, LayoutGrid, List, AlignJustify, Archive, Trash2, CheckSquare,
  ShieldCheck as Shield2FA,
} from 'lucide-react';
import type { Account, SignInMethod, Status, ViewMode } from './lib/types';
import { CATEGORIES } from './lib/types';
import { methodMeta } from './lib/meta';
import { useSettings } from './lib/hooks';
import { blankAccount, exportJson, loadAccounts, parseImport, saveAccounts } from './lib/store';
import { cn } from './lib/utils';
import { SecurityHealth } from './components/SecurityHealth';
import { StatsBar } from './components/StatsBar';
import { AccountCard } from './components/AccountCard';
import { AccountListItem } from './components/AccountListItem';
import { AccountModal } from './components/AccountModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { CommandPalette } from './components/CommandPalette';
import { SettingsPage } from './components/SettingsPage';
import { Toaster, type ToastMsg } from './components/Toast';

type Sort = 'recent' | 'name' | 'oldest' | 'category';

export default function App() {
  /* ── Settings ── */
  const { settings, update: updateSetting } = useSettings();

  /* ── Core state ── */
  const [accounts, setAccounts] = useState<Account[]>(() => loadAccounts());
  const [page, setPage] = useState<'main' | 'settings'>('main');

  /* ── Search & filters ── */
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState<SignInMethod | 'all'>('all');
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<Status | 'all' | 'favorite'>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [filter2FA, setFilter2FA] = useState<'all' | 'yes' | 'no'>('all');
  const [filterPw, setFilterPw] = useState<'all' | 'saved' | 'none'>('all');

  /* ── UI state ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Account | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [cmdOpen, setCmdOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Persistence ── */
  useEffect(() => saveAccounts(accounts), [accounts]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((s) => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ── Helpers ── */
  const notify = (text: string, kind: ToastMsg['kind'] = 'info') =>
    setToasts((t) => [...t, { id: Date.now() + Math.random(), text, kind }]);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  const toggleTheme = () => updateSetting('darkMode', !settings.darkMode);

  /* ── CRUD handlers ── */
  const openNew = () => { setEditing(blankAccount(settings)); setModalOpen(true); };
  const openEdit = (a: Account) => { setEditing(a); setModalOpen(true); };

  const handleSave = (a: Account) => {
    setAccounts((list) => {
      const exists = list.some((x) => x.id === a.id);
      return exists ? list.map((x) => (x.id === a.id ? a : x)) : [a, ...list];
    });
    setModalOpen(false);
    notify(accounts.some((x) => x.id === a.id) ? 'Record updated' : 'Account added', 'success');
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setAccounts((list) => list.filter((x) => x.id !== pendingDelete.id));
    setSelectedIds((s) => { const n = new Set(s); n.delete(pendingDelete.id); return n; });
    notify('Record removed', 'info');
    setPendingDelete(null);
  };

  const toggleFav = (a: Account) =>
    setAccounts((list) => list.map((x) => (x.id === a.id ? { ...x, favorite: !x.favorite } : x)));

  /* ── Import ── */
  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseImport(String(reader.result));
      if (!parsed) { notify('Invalid backup file', 'error'); return; }
      setAccounts((list) => {
        const ids = new Set(list.map((x) => x.id));
        const fresh = parsed.filter((x) => !ids.has(x.id));
        return [...fresh, ...list];
      });
      notify(`Imported ${parsed.length} record(s)`, 'success');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* ── Bulk actions ── */
  const toggleSelect = (id: string) => setSelectedIds((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const clearSelection = () => setSelectedIds(new Set());
  const selectAllVisible = () => setSelectedIds(new Set(filtered.map((a) => a.id)));

  const bulkArchive = () => {
    setAccounts((list) => list.map((x) => selectedIds.has(x.id) ? { ...x, status: 'archived' as const } : x));
    notify(`${selectedIds.size} account(s) archived`, 'success');
    clearSelection();
  };

  const bulkDelete = () => {
    setAccounts((list) => list.filter((x) => !selectedIds.has(x.id)));
    notify(`${selectedIds.size} account(s) deleted`, 'info');
    clearSelection();
  };

  const bulkExport = () => {
    const subset = accounts.filter((a) => selectedIds.has(a.id));
    exportJson(subset);
    notify(`Exported ${subset.length} account(s)`, 'success');
  };

  /* ── Filtered + sorted accounts ── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = accounts.filter((a) => {
      if (method !== 'all' && a.signInMethod !== method) return false;
      if (category !== 'all' && a.category !== category) return false;
      if (status === 'favorite' && !a.favorite) return false;
      if (status !== 'all' && status !== 'favorite' && a.status !== status) return false;
      if (!settings.showArchived && a.status === 'archived' && status !== 'archived') return false;
      if (filter2FA === 'yes' && !a.twoFactor) return false;
      if (filter2FA === 'no' && a.twoFactor) return false;
      if (filterPw === 'saved' && !(a.savePassword && a.password)) return false;
      if (filterPw === 'none' && a.savePassword && a.password) return false;
      if (q) {
        const hay = [a.service, a.identifier, a.notes, a.category, a.utmSource, a.utmCampaign, a.username, ...a.tags]
          .filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === 'name') return a.service.localeCompare(b.service);
      if (sort === 'category') return a.category.localeCompare(b.category) || a.service.localeCompare(b.service);
      if (sort === 'oldest') return +new Date(a.createdAt) - +new Date(b.createdAt);
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return out;
  }, [accounts, query, method, category, status, sort, filter2FA, filterPw, settings.showArchived]);

  const activeFilters = method !== 'all' || category !== 'all' || status !== 'all' || query.trim() !== '' || filter2FA !== 'all' || filterPw !== 'all';
  const clearFilters = () => { setMethod('all'); setCategory('all'); setStatus('all'); setQuery(''); setFilter2FA('all'); setFilterPw('all'); };

  /* ── Command palette actions ── */
  const handleCmdAction = (id: string) => {
    if (id === 'add') openNew();
    else if (id === 'settings') setPage('settings');
    else if (id === 'export') { exportJson(accounts); notify('Backup downloaded', 'success'); }
    else if (id === 'theme') toggleTheme();
  };

  /* ══════════════════════════════ RENDER ══════════════════════════════ */
  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3.5 lg:px-8">
          <div className="flex cursor-pointer items-center gap-2.5" onClick={() => setPage('main')}>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold text-ink">Keyhold</div>
              <div className="-mt-0.5 hidden text-[11px] text-muted sm:block">your private sign-in ledger</div>
            </div>
          </div>

          {/* Desktop search */}
          {page === 'main' && (
            <div className="relative ml-auto hidden max-w-md flex-1 md:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services, emails, tags, notes…"
                className="w-full rounded-xl border border-line bg-card py-2.5 pl-10 pr-16 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <kbd
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded bg-panel px-1.5 py-0.5 text-[10px] font-bold text-muted"
                onClick={() => setCmdOpen(true)}
              >
                ⌘K
              </kbd>
            </div>
          )}

          <div className={cn('flex items-center gap-1.5', page !== 'main' && 'ml-auto')}>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
            {page === 'main' && (
              <>
                <IconBtn title="Import backup" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /></IconBtn>
                <IconBtn title="Export backup" onClick={() => { exportJson(accounts); notify('Backup downloaded', 'success'); }}><Download className="h-4 w-4" /></IconBtn>
              </>
            )}
            <IconBtn title="Toggle theme" onClick={toggleTheme}>{settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</IconBtn>
            <IconBtn title="Settings" onClick={() => setPage(page === 'settings' ? 'main' : 'settings')}>
              <GearIcon className={cn('h-4 w-4', page === 'settings' && 'text-brand')} />
            </IconBtn>
            {page === 'main' && (
              <button onClick={openNew} className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brandDeep">
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add account</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Page routing ── */}
      <AnimatePresence mode="wait">
        {page === 'settings' ? (
          <SettingsPage
            key="settings"
            settings={settings}
            update={updateSetting}
            accounts={accounts}
            setAccounts={setAccounts}
            onBack={() => setPage('main')}
            notify={notify}
          />
        ) : (
          <motion.main key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
            {/* Hero */}
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
              <div className="mb-5 flex flex-col gap-1">
                <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
                  Every login, in one calm place.
                </h1>
                <p className="text-sm text-muted">
                  Track where you signed up, how you verified, and what password you set — stored privately on this device.
                </p>
              </div>
              <SecurityHealth accounts={accounts} />
              <StatsBar accounts={accounts} />
            </motion.section>

            {/* Mobile search */}
            <div className="relative mb-4 md:hidden">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="w-full rounded-xl border border-line bg-card py-2.5 pl-10 pr-3 text-sm text-ink outline-none focus:border-brand" />
            </div>

            {/* Toolbar */}
            <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              {/* Scrollable Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:pb-0">
                <span className="mr-1 inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
                </span>
                <Pill active={status === 'all' && method === 'all' && category === 'all' && filter2FA === 'all' && filterPw === 'all'} onClick={clearFilters}>All</Pill>
                <Pill active={status === 'favorite'} onClick={() => setStatus(status === 'favorite' ? 'all' : 'favorite')}>★ Favorites</Pill>
                <Pill active={status === 'active'} onClick={() => setStatus(status === 'active' ? 'all' : 'active')}>Active</Pill>
                <Pill active={status === 'inactive'} onClick={() => setStatus(status === 'inactive' ? 'all' : 'inactive')}>Inactive</Pill>
                <Pill active={status === 'archived'} onClick={() => setStatus(status === 'archived' ? 'all' : 'archived')}>Archived</Pill>

                <div className="mx-1 hidden h-4 w-px shrink-0 bg-line sm:block" />
                {(Object.keys(methodMeta) as SignInMethod[]).map((k) => (
                  <Pill key={k} active={method === k} onClick={() => setMethod(method === k ? 'all' : k)}>{methodMeta[k].short}</Pill>
                ))}

                <div className="mx-1 hidden h-4 w-px shrink-0 bg-line sm:block" />
                <Pill active={filter2FA === 'yes'} onClick={() => setFilter2FA(filter2FA === 'yes' ? 'all' : 'yes')}>
                  <Shield2FA className="mr-0.5 inline h-3 w-3" /> 2FA
                </Pill>
                <Pill active={filterPw === 'saved'} onClick={() => setFilterPw(filterPw === 'saved' ? 'all' : 'saved')}>🔑 Password</Pill>
              </div>

              {/* View options */}
              <div className="flex shrink-0 items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:pb-0">
                <ViewToggle mode={settings.viewMode} onChange={(m) => updateSetting('viewMode', m)} />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="shrink-0 rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-ink outline-none focus:border-brand">
                  <option value="all">All categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="relative shrink-0">
                  <ArrowDownWideNarrow className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                  <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="shrink-0 rounded-lg border border-line bg-card py-1.5 pl-7 pr-2 text-xs font-medium text-ink outline-none focus:border-brand">
                    <option value="recent">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="name">A – Z</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk action bar */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-brand bg-brandSoft px-4 py-2.5"
                >
                  <span className="text-sm font-semibold text-ink">{selectedIds.size} selected</span>
                  <button onClick={selectAllVisible} className="text-xs font-semibold text-brand hover:text-brandDeep">
                    <CheckSquare className="mr-0.5 inline h-3.5 w-3.5" /> Select all ({filtered.length})
                  </button>
                  <div className="mx-1 h-4 w-px bg-brand/30" />
                  <BulkBtn onClick={bulkArchive}><Archive className="h-3.5 w-3.5" /> Archive</BulkBtn>
                  <BulkBtn onClick={bulkExport}><Download className="h-3.5 w-3.5" /> Export</BulkBtn>
                  <BulkBtn onClick={bulkDelete} danger><Trash2 className="h-3.5 w-3.5" /> Delete</BulkBtn>
                  <button onClick={clearSelection} className="ml-auto rounded-lg p-1.5 text-muted hover:text-ink" title="Clear selection">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Account view */}
            {filtered.length > 0 ? (
              settings.viewMode === 'card' ? (
                <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((a, i) => (
                      <AccountCard
                        key={a.id}
                        account={a}
                        index={i}
                        selected={selectedIds.has(a.id)}
                        onSelect={toggleSelect}
                        onEdit={openEdit}
                        onDelete={setPendingDelete}
                        onToggleFav={toggleFav}
                        notify={notify}
                        autoMask={settings.autoMaskPasswords}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((a, i) => (
                      <AccountListItem
                        key={a.id}
                        account={a}
                        index={i}
                        compact={settings.viewMode === 'compact'}
                        selected={selectedIds.has(a.id)}
                        onSelect={toggleSelect}
                        onEdit={openEdit}
                        onDelete={setPendingDelete}
                        onToggleFav={toggleFav}
                        notify={notify}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )
            ) : (
              <EmptyState hasAny={accounts.length > 0} activeFilters={activeFilters} onAdd={openNew} onClear={clearFilters} />
            )}

            <footer className="mt-14 border-t border-line pt-6 text-center text-xs text-muted">
              <p>Keyhold keeps all data in your browser — nothing is uploaded. Export a backup regularly to keep it safe.</p>
              <p className="mt-1.5">
                Press <kbd className="rounded bg-panel px-1.5 py-0.5 text-[10px] font-bold text-muted">⌘K</kbd> for quick search & actions
              </p>
            </footer>
          </motion.main>
        )}
      </AnimatePresence>

      {/* ── Overlays ── */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        accounts={accounts}
        dark={settings.darkMode}
        onSelectAccount={openEdit}
        onAction={handleCmdAction}
      />

      {editing && (
        <AccountModal open={modalOpen} initial={editing} settings={settings} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this record?"
        message={pendingDelete ? `"${pendingDelete.service}" will be permanently removed from your ledger.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <Toaster toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

/* ══════════════════════════ Sub-components ══════════════════════════ */

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button onClick={onClick} title={title} className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-card text-muted transition-colors hover:border-brand/40 hover:text-ink">
      {children}
    </button>
  );
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors', active ? 'border-brand bg-brand text-white' : 'border-line bg-card text-muted hover:border-brand/40 hover:text-ink')}>
      {children}
    </button>
  );
}

function BulkBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cn('inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors', danger ? 'text-rose hover:bg-rose/10' : 'text-ink hover:bg-panel')}>
      {children}
    </button>
  );
}

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (v: ViewMode) => void }) {
  const opts: { value: ViewMode; Icon: typeof LayoutGrid; label: string }[] = [
    { value: 'card', Icon: LayoutGrid, label: 'Card' },
    { value: 'list', Icon: List, label: 'List' },
    { value: 'compact', Icon: AlignJustify, label: 'Compact' },
  ];
  return (
    <div className="inline-flex shrink-0 rounded-xl border border-line bg-panel p-0.5">
      {opts.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          title={o.label}
          className={cn('rounded-lg px-2 py-1.5 transition-colors', mode === o.value ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink')}
        >
          <o.Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

function EmptyState({ hasAny, activeFilters, onAdd, onClear }: { hasAny: boolean; activeFilters: boolean; onAdd: () => void; onClear: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid place-items-center rounded-3xl border border-dashed border-line bg-card/50 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brandSoft">
        <KeyRound className="h-8 w-8 text-brand" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-ink">
        {activeFilters ? 'No matching records' : 'Your ledger is empty'}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">
        {activeFilters ? 'Try clearing your filters or searching for something else.' : 'Add the first place you signed in and start building your private index.'}
      </p>
      <div className="mt-5 flex gap-2">
        {activeFilters && hasAny && (
          <button onClick={onClear} className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-panel">
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
        <button onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brandDeep">
          <Plus className="h-4 w-4" /> Add account
        </button>
      </div>
    </motion.div>
  );
}
