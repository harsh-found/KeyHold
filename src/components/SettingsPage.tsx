import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Check, Sun, Moon, LayoutGrid, List, AlignJustify, Shield, Database,
  Download, Upload, Trash2, Info, Type,
} from 'lucide-react';
import type { Account, AppSettings, FontScale, SignInMethod, ViewMode } from '../lib/types';
import { CATEGORIES } from '../lib/types';
import { THEMES } from '../lib/themes';
import { methodMeta } from '../lib/meta';
import {
  clearAllData, exportJson, formatBytes, getStorageUsage, parseImport,
} from '../lib/store';
import { cn } from '../lib/utils';

interface Props {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  onBack: () => void;
  notify: (text: string, kind?: 'success' | 'info' | 'error') => void;
}

export function SettingsPage({ settings, update, accounts, setAccounts, onBack, notify }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const storage = getStorageUsage();

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

  const handleClearAll = () => {
    clearAllData();
    setAccounts([]);
    setConfirmClear(false);
    notify('All data cleared', 'info');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="mx-auto max-w-3xl px-5 py-7 lg:px-8"
    >
      {/* Header */}
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Ledger
      </button>
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight text-ink">Settings</h1>

      <div className="space-y-8">
        {/* ═══ APPEARANCE ═══ */}
        <Section icon={<Sun className="h-5 w-5" />} title="Appearance">
          {/* Theme picker */}
          <Label>Choose a theme</Label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {THEMES.map((t) => (
              <ThemeCard key={t.id} theme={t} active={settings.theme === t.id} onClick={() => update('theme', t.id)} />
            ))}
          </div>

          {/* Dark mode */}
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-panel/40 px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-ink">Dark mode</span>
              <span className="block text-xs text-muted">Switch between light and dark appearance</span>
            </div>
            <Toggle on={settings.darkMode} onChange={(v) => update('darkMode', v)} />
          </div>

          {/* View mode */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-panel/40 px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-ink">Default view</span>
              <span className="block text-xs text-muted">How accounts are displayed</span>
            </div>
            <ViewModeSelector mode={settings.viewMode} onChange={(v) => update('viewMode', v)} />
          </div>

          {/* Font scale */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-panel/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted" />
              <div>
                <span className="text-sm font-semibold text-ink">Font scale</span>
                <span className="block text-xs text-muted">Adjust text size</span>
              </div>
            </div>
            <FontScaleSelector scale={settings.fontSize} onChange={(v) => update('fontSize', v)} />
          </div>
        </Section>

        {/* ═══ SECURITY ═══ */}
        <Section icon={<Shield className="h-5 w-5" />} title="Security">
          <div className="flex items-center justify-between rounded-2xl border border-line bg-panel/40 px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-ink">Auto-mask passwords</span>
              <span className="block text-xs text-muted">Hide passwords on account cards by default</span>
            </div>
            <Toggle on={settings.autoMaskPasswords} onChange={(v) => update('autoMaskPasswords', v)} />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-panel/40 px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-ink">Clear clipboard after copy</span>
              <span className="block text-xs text-muted">Automatically clear copied text from clipboard</span>
            </div>
            <select
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-ink outline-none focus:border-brand"
              value={settings.clipboardClearSeconds}
              onChange={(e) => update('clipboardClearSeconds', Number(e.target.value))}
            >
              <option value={0}>Never</option>
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
            </select>
          </div>
        </Section>

        {/* ═══ DEFAULTS ═══ */}
        <Section icon={<Info className="h-5 w-5" />} title="Defaults">
          <div className="flex items-center justify-between rounded-2xl border border-line bg-panel/40 px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-ink">Default category</span>
              <span className="block text-xs text-muted">Pre-selected when adding new accounts</span>
            </div>
            <select
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-ink outline-none focus:border-brand"
              value={settings.defaultCategory}
              onChange={(e) => update('defaultCategory', e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-panel/40 px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-ink">Default sign-in method</span>
              <span className="block text-xs text-muted">Pre-selected method for new entries</span>
            </div>
            <select
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-ink outline-none focus:border-brand"
              value={settings.defaultSignInMethod}
              onChange={(e) => update('defaultSignInMethod', e.target.value as SignInMethod)}
            >
              {(Object.keys(methodMeta) as SignInMethod[]).map((k) => (
                <option key={k} value={k}>{methodMeta[k].label}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-panel/40 px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-ink">Show archived accounts</span>
              <span className="block text-xs text-muted">Include archived entries in the main view</span>
            </div>
            <Toggle on={settings.showArchived} onChange={(v) => update('showArchived', v)} />
          </div>
        </Section>

        {/* ═══ DATA & BACKUP ═══ */}
        <Section icon={<Database className="h-5 w-5" />} title="Data & Backup">
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => { exportJson(accounts); notify('Backup downloaded', 'success'); }}
              className="flex items-center gap-3 rounded-2xl border border-line bg-panel/40 px-4 py-3 text-left transition-colors hover:border-brand/40"
            >
              <Download className="h-5 w-5 text-brand" />
              <div>
                <span className="text-sm font-semibold text-ink">Export all data</span>
                <span className="block text-xs text-muted">Download JSON backup</span>
              </div>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-3 rounded-2xl border border-line bg-panel/40 px-4 py-3 text-left transition-colors hover:border-brand/40"
            >
              <Upload className="h-5 w-5 text-brand" />
              <div>
                <span className="text-sm font-semibold text-ink">Import backup</span>
                <span className="block text-xs text-muted">Merge records from file</span>
              </div>
            </button>
          </div>

          {/* Storage usage */}
          <div className="mt-4 rounded-2xl border border-line bg-panel/40 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Storage used</span>
              <span className="text-sm font-semibold text-ink">{formatBytes(storage.bytes)}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${Math.min(100, (storage.bytes / (5 * 1024 * 1024)) * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted">{storage.keys} keys · ~5 MB available in localStorage</p>
          </div>

          {/* Danger zone */}
          <div className="mt-4 rounded-2xl border border-rose/30 bg-rose/5 px-4 py-3">
            {!confirmClear ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-rose">Clear all data</span>
                  <span className="block text-xs text-muted">Permanently delete everything</span>
                </div>
                <button
                  onClick={() => setConfirmClear(true)}
                  className="rounded-xl border border-rose/40 px-4 py-2 text-sm font-semibold text-rose transition-colors hover:bg-rose/10"
                >
                  <Trash2 className="mr-1.5 inline h-4 w-4" /> Delete
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-rose">Are you sure? This cannot be undone.</p>
                <div className="mt-3 flex justify-center gap-2">
                  <button onClick={() => setConfirmClear(false)} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink">
                    Cancel
                  </button>
                  <button onClick={handleClearAll} className="rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white">
                    Yes, delete everything
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ═══ ABOUT ═══ */}
        <Section icon={<Info className="h-5 w-5" />} title="About">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <AboutItem label="Version" value="2.0.0" />
            <AboutItem label="Accounts" value={String(accounts.length)} />
            <AboutItem label="Storage" value={formatBytes(storage.bytes)} />
          </div>
          <p className="mt-4 text-xs text-muted">
            Built with React 19 · Vite 7 · Tailwind CSS v4 · Framer Motion · Lucide Icons
          </p>
          <p className="mt-1 text-xs text-muted">
            All data is stored locally in your browser. Nothing is ever uploaded.
          </p>
        </Section>
      </div>
    </motion.div>
  );
}

/* ────────────────── Sub-components ────────────────── */

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-line bg-card p-6"
    >
      <h2 className="mb-5 flex items-center gap-2.5 font-display text-lg font-semibold text-ink">
        <span className="text-brand">{icon}</span> {title}
      </h2>
      {children}
    </motion.section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted">{children}</p>;
}

function AboutItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel/40 px-3 py-2.5 text-center">
      <div className="text-lg font-semibold text-ink">{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-brand' : 'bg-line')}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

function ThemeCard({ theme, active, onClick }: { theme: typeof THEMES[0]; active: boolean; onClick: () => void }) {
  const c = theme.colors.light;
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border-2 p-1 transition-all',
        active ? 'border-brand shadow-md ring-2 ring-brand/20' : 'border-line hover:border-brand/40',
      )}
    >
      {/* Mini preview */}
      <div className="aspect-[4/3] rounded-xl overflow-hidden" style={{ background: c.paper }}>
        <div className="h-2.5" style={{ background: c.card, borderBottom: `1px solid ${c.line}` }} />
        <div className="space-y-1.5 p-1.5">
          <div className="rounded-md p-1.5" style={{ background: c.card, border: `1px solid ${c.line}` }}>
            <div className="h-1.5 w-7 rounded-full" style={{ background: c.brand }} />
            <div className="mt-1 h-1 w-10 rounded-full" style={{ background: c.ink, opacity: 0.6 }} />
            <div className="mt-0.5 h-1 w-7 rounded-full" style={{ background: c.muted, opacity: 0.4 }} />
          </div>
          <div className="rounded-md p-1.5" style={{ background: c.card, border: `1px solid ${c.line}` }}>
            <div className="h-1.5 w-5 rounded-full" style={{ background: c.amber }} />
            <div className="mt-1 h-1 w-8 rounded-full" style={{ background: c.ink, opacity: 0.6 }} />
          </div>
        </div>
      </div>
      <p className="mt-1.5 pb-0.5 text-center text-[11px] font-semibold text-ink">{theme.name}</p>
      {active && (
        <div className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-white shadow">
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

function ViewModeSelector({ mode, onChange }: { mode: ViewMode; onChange: (v: ViewMode) => void }) {
  const opts: { value: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { value: 'card', icon: LayoutGrid, label: 'Card' },
    { value: 'list', icon: List, label: 'List' },
    { value: 'compact', icon: AlignJustify, label: 'Compact' },
  ];
  return (
    <div className="inline-flex rounded-xl border border-line bg-panel p-0.5">
      {opts.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          title={o.label}
          className={cn(
            'rounded-lg px-2.5 py-1.5 transition-colors',
            mode === o.value ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          <o.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

function FontScaleSelector({ scale, onChange }: { scale: FontScale; onChange: (v: FontScale) => void }) {
  const opts: { value: FontScale; label: string }[] = [
    { value: 'small', label: 'S' },
    { value: 'medium', label: 'M' },
    { value: 'large', label: 'L' },
  ];
  return (
    <div className="inline-flex rounded-xl border border-line bg-panel p-0.5">
      {opts.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-bold transition-colors',
            scale === o.value ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
