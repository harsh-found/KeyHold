import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Save, Wand2, Eye, EyeOff, Star, Globe, Image as ImageIcon, RefreshCw, User, Mail, KeyRound as KeyIcon,
} from 'lucide-react';
import type { Account, AppSettings, SignInMethod, Status, Verification } from '../lib/types';
import { CATEGORIES } from '../lib/types';
import { methodMeta, verificationMeta } from '../lib/meta';
import { Field, inputCls } from './Field';
import { ServiceIcon } from './ServiceIcon';
import { cn, fromDateInput, generatePassword, passwordStrength, toDateInput } from '../lib/utils';

interface Props {
  open: boolean;
  initial: Account;
  settings: AppSettings;
  onClose: () => void;
  onSave: (a: Account) => void;
}

export function AccountModal({ open, initial, settings, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Account>(initial);
  const [showPw, setShowPw] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) {
      setDraft(initial);
      setShowPw(false);
      setTagInput('');
      setErr('');
    }
  }, [open, initial]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const strength = useMemo(() => passwordStrength(draft.password || ''), [draft.password]);
  const set = <K extends keyof Account>(k: K, v: Account[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (t && !draft.tags.includes(t)) set('tags', [...draft.tags, t]);
    setTagInput('');
  };

  const submit = () => {
    if (!draft.service.trim()) {
      setErr('Give this account a name first.');
      return;
    }
    onSave({ ...draft, service: draft.service.trim(), updatedAt: new Date().toISOString() });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative my-auto w-full max-w-2xl rounded-3xl border border-line bg-card shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="flex items-center gap-3.5 border-b border-line px-6 py-5">
              <ServiceIcon account={draft} size={44} />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-semibold text-ink">
                  {initial.service ? 'Edit account' : 'New sign-in record'}
                </h2>
                <p className="text-xs text-muted">Everything stays on this device.</p>
              </div>
              <button onClick={() => set('favorite', !draft.favorite)} className={cn('rounded-lg p-2', draft.favorite ? 'text-amber' : 'text-muted hover:text-amber')} title="Favorite">
                <Star className={cn('h-5 w-5', draft.favorite && 'fill-current')} />
              </button>
              <button onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-panel hover:text-ink" title="Close">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="max-h-[68vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Service / app name">
                  <input autoFocus className={inputCls} value={draft.service} onChange={(e) => set('service', e.target.value)} placeholder="e.g. Spotify" />
                </Field>
                <Field label="Category">
                  <select className={inputCls} value={draft.category} onChange={(e) => set('category', e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Website URL" hint="auto-fetches icon">
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input className={cn(inputCls, 'pl-9')} value={draft.url} onChange={(e) => set('url', e.target.value)} placeholder="spotify.com" />
                  </div>
                </Field>
                <Field label="Custom icon URL" hint="optional">
                  <div className="relative">
                    <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input className={cn(inputCls, 'pl-9')} value={draft.iconUrl} onChange={(e) => set('iconUrl', e.target.value)} placeholder="https://.../logo.png" />
                  </div>
                </Field>
              </div>

              <Field label="Signed in with">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(methodMeta) as SignInMethod[]).map((k) => {
                    const M = methodMeta[k];
                    const on = draft.signInMethod === k;
                    return (
                      <button key={k} onClick={() => set('signInMethod', k)} className={cn('inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors', on ? 'border-brand bg-brandSoft text-brandDeep' : 'border-line bg-paper text-muted hover:border-brand/40 hover:text-ink')}>
                        <M.Icon className="h-4 w-4" />
                        {M.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label={draft.signInMethod === 'phone' ? 'Phone number' : 'Email / identifier used'}>
                <input className={cn(inputCls, 'font-mono')} value={draft.identifier} onChange={(e) => set('identifier', e.target.value)} placeholder={draft.signInMethod === 'phone' ? '+91 90000 00000' : 'you@gmail.com'} />
              </Field>

              <Field label="Verification method">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(verificationMeta) as Verification[]).map((k) => {
                    const V = verificationMeta[k];
                    const on = draft.verification === k;
                    return (
                      <button key={k} onClick={() => set('verification', k)} className={cn('inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors', on ? 'border-amber bg-amber/10 text-amber' : 'border-line bg-paper text-muted hover:border-amber/40 hover:text-ink')}>
                        <V.Icon className="h-4 w-4" />
                        {V.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="rounded-2xl border border-line bg-panel/40 p-4">
                <label className="flex cursor-pointer items-center justify-between">
                  <span>
                    <span className="text-sm font-semibold text-ink">Save a password for this account</span>
                    <span className="block text-xs text-muted">Stored locally in your browser only.</span>
                  </span>
                  <Toggle on={draft.savePassword} onChange={(v) => set('savePassword', v)} />
                </label>
                {draft.savePassword && (
                  <div className="mt-4 space-y-2">
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} className={cn(inputCls, 'pr-24 font-mono')} value={draft.password} onChange={(e) => set('password', e.target.value)} placeholder="Enter or generate" />
                      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                        <button onClick={() => setShowPw((s) => !s)} className="rounded-md p-1.5 text-muted hover:text-ink" title={showPw ? 'Hide' : 'Show'}>
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button onClick={() => { set('password', generatePassword()); setShowPw(true); }} className="rounded-md p-1.5 text-muted hover:text-brand" title="Generate strong password">
                          <Wand2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {draft.password && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-1.5 flex-1 gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="h-full flex-1 rounded-full" style={{ background: i < strength.score ? strength.color : 'var(--line)' }} />
                          ))}
                        </div>
                        <span className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Date added">
                  <input type="date" className={inputCls} value={toDateInput(draft.createdAt)} onChange={(e) => set('createdAt', fromDateInput(e.target.value))} />
                </Field>
                <Field label="Last used" hint="optional">
                  <input type="date" className={inputCls} value={draft.lastUsed ? toDateInput(draft.lastUsed) : ''} onChange={(e) => set('lastUsed', e.target.value ? fromDateInput(e.target.value) : '')} />
                </Field>
                <Field label="Status">
                  <select className={inputCls} value={draft.status} onChange={(e) => set('status', e.target.value as Status)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-line bg-panel/40 px-4 py-3">
                <span>
                  <span className="text-sm font-semibold text-ink">Two-factor / 2FA enabled</span>
                  <span className="block text-xs text-muted">TOTP, authenticator app or SMS second step.</span>
                </span>
                <Toggle on={draft.twoFactor} onChange={(v) => set('twoFactor', v)} />
              </label>

              <Field label="Tags" hint="press Enter to add">
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2">
                  {draft.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full bg-brandSoft px-2 py-0.5 text-xs font-medium text-brandDeep">
                      #{t}
                      <button onClick={() => set('tags', draft.tags.filter((x) => x !== t))} className="text-brandDeep/60 hover:text-rose">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    className="min-w-[100px] flex-1 bg-transparent py-0.5 text-sm text-ink outline-none placeholder:text-muted/60"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder={draft.tags.length ? '' : 'work, shared, gaming…'}
                  />
                </div>
              </Field>

              <Field label="Notes">
                <textarea className={cn(inputCls, 'min-h-[80px] resize-y')} value={draft.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Recovery email, plan tier, who it's shared with…" />
              </Field>

              {/* ── Extra Details (v2 fields) ── */}
              <details className="group rounded-2xl border border-line bg-panel/40">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-ink">
                  <span className="inline-flex items-center gap-2"><User className="h-4 w-4 text-muted" /> Extra details</span>
                  <span className="text-xs font-normal text-muted">optional</span>
                </summary>
                <div className="grid grid-cols-1 gap-4 px-4 pb-4 sm:grid-cols-2">
                  <Field label="Username / display name">
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input className={cn(inputCls, 'pl-9')} value={draft.username || ''} onChange={(e) => set('username', e.target.value)} placeholder="@handle or display name" />
                    </div>
                  </Field>
                  <Field label="Recovery email">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input className={cn(inputCls, 'pl-9')} value={draft.recoveryEmail || ''} onChange={(e) => set('recoveryEmail', e.target.value)} placeholder="backup@email.com" />
                    </div>
                  </Field>
                </div>
                <div className="px-4 pb-4">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-paper px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <KeyIcon className="h-4 w-4 text-muted" />
                      <span className="text-sm font-medium text-ink">Backup codes stored</span>
                    </span>
                    <Toggle on={draft.backupCodes || false} onChange={(v) => set('backupCodes', v)} />
                  </label>
                </div>
              </details>

              {/* ── Source & UTM tracking ── */}
              <details className="group rounded-2xl border border-line bg-panel/40">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-ink">
                  <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 text-muted" /> Source &amp; UTM tracking</span>
                  <span className="text-xs font-normal text-muted">optional</span>
                </summary>
                <div className="grid grid-cols-1 gap-4 px-4 pb-4 sm:grid-cols-2">
                  <Field label="How you found it (source)">
                    <input className={inputCls} value={draft.utmSource} onChange={(e) => set('utmSource', e.target.value)} placeholder="google, referral, instagram ad…" />
                  </Field>
                  <Field label="Campaign / context">
                    <input className={inputCls} value={draft.utmCampaign} onChange={(e) => set('utmCampaign', e.target.value)} placeholder="launch-week, black-friday…" />
                  </Field>
                </div>
              </details>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
              <span className="text-sm text-rose">{err}</span>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink">Cancel</button>
                <button onClick={submit} className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brandDeep">
                  <Save className="h-4 w-4" /> Save record
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
