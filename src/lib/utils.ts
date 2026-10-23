import type { Account } from './types';

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function domainFromUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const withProto = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    const host = new URL(withProto).hostname.replace(/^www\./, '');
    return host || null;
  } catch {
    return null;
  }
}

export function faviconFor(acc: Pick<Account, 'iconUrl' | 'url'>): string | null {
  if (acc.iconUrl && acc.iconUrl.trim()) return acc.iconUrl.trim();
  const d = domainFromUrl(acc.url);
  if (d) return `https://www.google.com/s2/favicons?domain=${d}&sz=128`;
  return null;
}

export function initials(name: string): string {
  const clean = name.trim();
  if (!clean) return '?';
  const words = clean.split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function tint(seed: string): string {
  const palette = ['#0e7c5a', '#bb6a34', '#3a7ca5', '#2a9d8f', '#9c6644', '#5a7d2a', '#b23b6e', '#3d7068'];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function relativeTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  if (isNaN(d)) return '';
  const diff = Date.now() - d;
  const day = 86400000;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < day) return Math.floor(diff / 3600000) + 'h ago';
  if (diff < day * 30) return Math.floor(diff / day) + 'd ago';
  if (diff < day * 365) return Math.floor(diff / (day * 30)) + 'mo ago';
  return Math.floor(diff / (day * 365)) + 'y ago';
}

export function toDateInput(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function fromDateInput(value: string): string {
  if (!value) return new Date().toISOString();
  const d = new Date(value + 'T12:00:00');
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function generatePassword(len = 18): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const nums = '23456789';
  const sym = '!@#$%^&*-_=+?';
  const all = upper + lower + nums + sym;
  const rng = new Uint32Array(len);
  crypto.getRandomValues(rng);
  const pick = (set: string, i: number) => set[rng[i] % set.length];
  // Guarantee at least one char from each class
  let out = pick(upper, 0) + pick(lower, 1) + pick(nums, 2) + pick(sym, 3);
  for (let i = out.length; i < len; i++) out += pick(all, i);
  // Shuffle using Fisher-Yates with crypto randomness
  const arr = out.split('');
  const shuffleRng = new Uint32Array(arr.length);
  crypto.getRandomValues(shuffleRng);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = shuffleRng[i] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export interface Strength {
  score: number; // 0-4
  label: string;
  color: string;
}

export function passwordStrength(pw: string): Strength {
  if (!pw) return { score: 0, label: 'Empty', color: 'var(--muted)' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 14) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: 'Very weak', color: '#b23b2e' },
    { label: 'Weak', color: '#bb6a34' },
    { label: 'Fair', color: '#c9a227' },
    { label: 'Strong', color: '#4a9d5b' },
    { label: 'Excellent', color: '#0e7c5a' },
  ];
  return { score: s, ...map[s] };
}
