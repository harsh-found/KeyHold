import { Mail, Phone, Ghost, Globe, Fingerprint, MessageSquareCode, KeyRound, Link2, ScanFace } from 'lucide-react';
import type { SignInMethod, Verification } from './types';

export const methodMeta: Record<SignInMethod, { label: string; short: string; Icon: typeof Mail }> = {
  gmail: { label: 'Gmail', short: 'Gmail', Icon: Mail },
  email: { label: 'Email address', short: 'Email', Icon: Mail },
  phone: { label: 'Phone number', short: 'Phone', Icon: Phone },
  tempmail: { label: 'Temp / burner mail', short: 'Temp', Icon: Ghost },
  other: { label: 'Other method', short: 'Other', Icon: Globe },
};

export const verificationMeta: Record<Verification, { label: string; short: string; Icon: typeof Mail }> = {
  oauth: { label: 'Google OAuth (1-click)', short: 'OAuth', Icon: Fingerprint },
  otp: { label: 'OTP code', short: 'OTP', Icon: MessageSquareCode },
  password: { label: 'Password', short: 'Password', Icon: KeyRound },
  magiclink: { label: 'Magic link', short: 'Magic link', Icon: Link2 },
  passkey: { label: 'Passkey', short: 'Passkey', Icon: ScanFace },
};
