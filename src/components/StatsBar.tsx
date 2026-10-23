import { motion } from 'framer-motion';
import { Layers, ShieldCheck, KeyRound, Zap } from 'lucide-react';
import type { Account } from '../lib/types';

export function StatsBar({ accounts }: { accounts: Account[] }) {
  const total = accounts.length;
  const active = accounts.filter((a) => a.status === 'active').length;
  const twoFa = accounts.filter((a) => a.twoFactor).length;
  const saved = accounts.filter((a) => a.savePassword && a.password).length;

  const stats = [
    { label: 'Total accounts', value: total, sub: `${active} active`, Icon: Layers, color: 'var(--brand)' },
    { label: 'Protected with 2FA', value: twoFa, sub: total ? `${Math.round((twoFa / total) * 100)}% coverage` : '—', Icon: ShieldCheck, color: 'var(--brand)' },
    { label: 'Passwords stored', value: saved, sub: 'encrypted locally', Icon: KeyRound, color: 'var(--amber)' },
    { label: 'OAuth / 1-click', value: accounts.filter((a) => a.verification === 'oauth').length, sub: 'no password needed', Icon: Zap, color: 'var(--amber)' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="flex items-center gap-3.5 rounded-2xl border border-line bg-card p-4"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: 'color-mix(in srgb, ' + s.color + ' 14%, transparent)' }}>
            <s.Icon className="h-5 w-5" style={{ color: s.color }} />
          </div>
          <div className="min-w-0">
            <div className="font-display text-2xl font-semibold leading-none text-ink">{s.value}</div>
            <div className="mt-1 truncate text-[11px] font-medium uppercase tracking-wide text-muted">{s.label}</div>
            <div className="truncate text-[11px] text-muted/80">{s.sub}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
