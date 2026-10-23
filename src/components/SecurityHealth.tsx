import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Account } from '../lib/types';
import { passwordStrength } from '../lib/utils';

interface Props {
  accounts: Account[];
}

interface Report {
  score: number;
  label: string;
  color: string;
  metrics: { label: string; value: string; status: 'good' | 'warning' | 'danger' }[];
}

function buildReport(accounts: Account[]): Report {
  const active = accounts.filter((a) => a.status === 'active');
  const total = active.length;
  if (total === 0) return { score: 100, label: 'No data', color: 'var(--muted)', metrics: [] };

  const with2FA = active.filter((a) => a.twoFactor).length;
  const pwAccounts = active.filter((a) => a.savePassword && a.password);
  const weak = pwAccounts.filter((a) => passwordStrength(a.password || '').score < 3).length;
  const tempMail = active.filter((a) => a.signInMethod === 'tempmail').length;

  let score = 100;
  if (total > 0) score -= Math.round((1 - with2FA / total) * 30);
  if (pwAccounts.length > 0) score -= Math.round((weak / pwAccounts.length) * 25);
  score -= Math.min(15, tempMail * 5);
  score = Math.max(0, Math.min(100, score));

  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'At Risk';
  const color = score >= 80 ? 'var(--brand)' : score >= 60 ? 'var(--brand)' : score >= 40 ? 'var(--amber)' : 'var(--rose)';

  const metrics = [
    { label: '2FA Coverage', value: `${with2FA}/${total}`, status: with2FA >= total ? 'good' as const : 'warning' as const },
    { label: 'Strong Passwords', value: pwAccounts.length > 0 ? `${pwAccounts.length - weak}/${pwAccounts.length}` : '—', status: weak === 0 ? 'good' as const : 'warning' as const },
    { label: 'Active Accounts', value: `${total}`, status: 'good' as const },
    { label: 'Temp Mail', value: `${tempMail}`, status: tempMail === 0 ? 'good' as const : 'danger' as const },
  ];

  return { score, label, color, metrics };
}

export function SecurityHealth({ accounts }: Props) {
  const report = useMemo(() => buildReport(accounts), [accounts]);

  if (accounts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="mb-4 flex flex-col items-center gap-5 rounded-2xl border border-line bg-card p-5 sm:flex-row"
    >
      {/* Score ring */}
      <div className="relative shrink-0">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--line)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34" fill="none" stroke={report.color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 34}
            strokeDashoffset={2 * Math.PI * 34 * (1 - report.score / 100)}
            transform="rotate(-90 40 40)"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold text-ink">{report.score}</span>
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {report.score >= 60 ? (
            <ShieldCheck className="h-5 w-5" style={{ color: report.color }} />
          ) : (
            <ShieldAlert className="h-5 w-5" style={{ color: report.color }} />
          )}
          <h3 className="font-display text-lg font-semibold text-ink">Security Health</h3>
          <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ color: report.color, background: `color-mix(in srgb, ${report.color} 12%, transparent)` }}>
            {report.label}
          </span>
        </div>

        {/* Metric chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {report.metrics.map((m) => {
            const Icon = m.status === 'good' ? CheckCircle : AlertTriangle;
            const col = m.status === 'good' ? 'var(--brand)' : m.status === 'warning' ? 'var(--amber)' : 'var(--rose)';
            return (
              <div
                key={m.label}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-panel/60 px-2.5 py-1"
              >
                <Icon className="h-3.5 w-3.5" style={{ color: col }} />
                <span className="text-xs text-ink">{m.label}</span>
                <span className="font-mono text-xs font-bold" style={{ color: col }}>{m.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
