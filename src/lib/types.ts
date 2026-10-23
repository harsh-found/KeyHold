export type SignInMethod = 'gmail' | 'email' | 'phone' | 'tempmail' | 'other';
export type Verification = 'oauth' | 'otp' | 'password' | 'magiclink' | 'passkey';
export type Status = 'active' | 'inactive' | 'archived';
export type ViewMode = 'card' | 'list' | 'compact';
export type FontScale = 'small' | 'medium' | 'large';

export interface Account {
  id: string;
  service: string;
  url?: string;
  iconUrl?: string;
  signInMethod: SignInMethod;
  identifier?: string;
  verification: Verification;
  password?: string;
  savePassword: boolean;
  category: string;
  tags: string[];
  notes?: string;
  twoFactor: boolean;
  favorite: boolean;
  status: Status;
  utmSource?: string;
  utmCampaign?: string;
  createdAt: string;
  lastUsed?: string;
  updatedAt: string;
  /* v2 fields — optional for backward compat */
  username?: string;
  recoveryEmail?: string;
  backupCodes?: boolean;
}

export interface AppSettings {
  theme: string;
  darkMode: boolean;
  viewMode: ViewMode;
  fontSize: FontScale;
  autoMaskPasswords: boolean;
  clipboardClearSeconds: number;
  defaultCategory: string;
  defaultSignInMethod: SignInMethod;
  showArchived: boolean;
}

export const CATEGORIES = [
  'General',
  'Streaming',
  'Finance',
  'Shopping',
  'Social',
  'Work',
  'Developer',
  'Gaming',
  'Education',
  'Health',
  'Travel',
  'AI Tools',
  'Utilities',
] as const;
