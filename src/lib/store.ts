import type { Account, AppSettings } from './types';
import { uid } from './utils';

/* ════════════════════════════════════════════════
   Account persistence
   ════════════════════════════════════════════════ */

const KEY = 'keyhold:accounts:v1';
const SEED_FLAG = 'keyhold:seeded:v1';

function now(): string {
  return new Date().toISOString();
}

function seed(): Account[] {
  const base = Date.now();
  const mk = (i: number, a: Partial<Account>): Account => ({
    id: uid(),
    service: '',
    signInMethod: 'gmail',
    verification: 'oauth',
    savePassword: false,
    category: 'General',
    tags: [],
    twoFactor: false,
    favorite: false,
    status: 'active',
    createdAt: new Date(base - i * 86400000 * 9).toISOString(),
    updatedAt: new Date(base - i * 86400000 * 9).toISOString(),
    ...a,
  });
  return [
    mk(0, {
      service: 'Netflix',
      url: 'netflix.com',
      signInMethod: 'gmail',
      identifier: 'you@gmail.com',
      verification: 'password',
      password: 'Str3am$Night!42',
      savePassword: true,
      category: 'Streaming',
      tags: ['family', 'shared'],
      favorite: true,
      notes: 'Premium plan, 4 screens. Shared with family profile.',
      utmSource: 'referral — sibling',
    }),
    mk(1, {
      service: 'GitHub',
      url: 'github.com',
      signInMethod: 'gmail',
      identifier: 'you@gmail.com',
      verification: 'oauth',
      category: 'Developer',
      tags: ['work'],
      twoFactor: true,
      favorite: true,
      notes: 'Signed in with Google. Passkey + TOTP enabled.',
      utmSource: 'organic search',
    }),
    mk(2, {
      service: 'Figma',
      url: 'figma.com',
      signInMethod: 'email',
      identifier: 'work@company.com',
      verification: 'magiclink',
      category: 'Work',
      tags: ['design'],
      notes: 'Company workspace seat.',
      utmSource: 'product hunt',
      utmCampaign: 'launch-week',
    }),
    mk(3, {
      service: 'Discord',
      url: 'discord.com',
      signInMethod: 'phone',
      identifier: '+91 98••••42',
      verification: 'otp',
      category: 'Social',
      tags: ['gaming'],
      twoFactor: true,
    }),
    mk(4, {
      service: 'A random giveaway site',
      url: '',
      signInMethod: 'tempmail',
      identifier: 'x7kq@tempmail.io',
      verification: 'otp',
      category: 'Utilities',
      status: 'inactive',
      notes: 'Used a burner mail — do not reuse. No sensitive data.',
      utmSource: 'instagram ad',
      utmCampaign: 'summer-promo',
    }),
  ];
}

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Account[];
      if (Array.isArray(parsed)) return parsed;
    }
    if (!localStorage.getItem(SEED_FLAG)) {
      const s = seed();
      saveAccounts(s);
      localStorage.setItem(SEED_FLAG, '1');
      return s;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to persist accounts', e);
  }
}

export function blankAccount(settings?: AppSettings): Account {
  return {
    id: uid(),
    service: '',
    url: '',
    iconUrl: '',
    signInMethod: settings?.defaultSignInMethod || 'gmail',
    identifier: '',
    verification: 'oauth',
    password: '',
    savePassword: false,
    category: settings?.defaultCategory || 'General',
    tags: [],
    notes: '',
    twoFactor: false,
    favorite: false,
    status: 'active',
    utmSource: '',
    utmCampaign: '',
    username: '',
    recoveryEmail: '',
    backupCodes: false,
    createdAt: now(),
    lastUsed: '',
    updatedAt: now(),
  };
}

export function exportJson(accounts: Account[]): void {
  const blob = new Blob([JSON.stringify({ app: 'keyhold', version: 2, exportedAt: now(), accounts }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `keyhold-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImport(text: string): Account[] | null {
  try {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : data.accounts;
    if (!Array.isArray(arr)) return null;
    return arr.map((a: Partial<Account>) => ({
      ...blankAccount(),
      ...a,
      id: a.id || uid(),
      tags: Array.isArray(a.tags) ? a.tags : [],
    })) as Account[];
  } catch {
    return null;
  }
}

/* ════════════════════════════════════════════════
   Settings persistence
   ════════════════════════════════════════════════ */

const SETTINGS_KEY = 'keyhold:settings:v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'ivory-sand',
  darkMode: false,
  viewMode: 'card',
  fontSize: 'medium',
  autoMaskPasswords: true,
  clipboardClearSeconds: 30,
  defaultCategory: 'General',
  defaultSignInMethod: 'gmail',
  showArchived: false,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

/* ════════════════════════════════════════════════
   Storage helpers
   ════════════════════════════════════════════════ */

export function getStorageUsage(): { bytes: number; keys: number } {
  let total = 0;
  let count = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('keyhold:')) {
        const val = localStorage.getItem(key) || '';
        total += (key.length + val.length) * 2; // UTF-16 = 2 bytes/char
        count++;
      }
    }
  } catch { /* ignore */ }
  return { bytes: total, keys: count };
}

export function clearAllData(): void {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('keyhold:')) toRemove.push(key);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
