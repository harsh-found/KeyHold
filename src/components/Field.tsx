import type { ReactNode } from 'react';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{label}</span>
        {hint && <span className="text-[11px] text-muted/70">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20';
