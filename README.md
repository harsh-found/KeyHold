<div align="center">

# 🔑 KeyHold

### Privacy-First Account Ledger, Sign-in Auditor & Security Vault

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.35-FF0055?style=for-the-badge&logo=framer&logoColor=black)](https://www.framer.com/motion/)
[![Security Audit](https://img.shields.io/badge/Security_Audit-Real--time-22C55E?style=for-the-badge&logo=shields-dot-io&logoColor=white)](#-security-health-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Never forget how you signed up. Never leave an account unshielded.</b><br>
  A zero-knowledge personal ledger for tracking authentication methods, auditing 2FA coverage, and generating cryptographically secure credentials entirely in your browser.
</p>

[Core Problem](#-the-problem-keyhold-solves) • [Key Features](#-key-features) • [Security Health Engine](#-security-health-engine) • [Directory Structure](#-directory-structure) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [Keyboard Shortcuts](#-keyboard-shortcuts)

</div>

---

## 🎯 The Problem KeyHold Solves

Modern web users hold hundreds of accounts across online services. The biggest point of friction and security vulnerability is **authentication sprawl**:
* Did you sign up with *Sign in with Google*, your personal email, an Apple relay address, or a temporary disposable inbox?
* Which critical services still lack **Two-Factor Authentication (2FA)**?
* Where have you stored passwords that need rotation?
* Cloud-based password managers are frequent targets of high-profile data breaches.

**KeyHold** solves this by acting as your **offline-first personal authentication ledger**. All data resides exclusively in your browser's local sandbox (`localStorage`). No servers, no tracking, no subscription fees.

---

## ✨ Key Features

### 1. 🛡️ Identity & Sign-In Method Mapping
* **Authentication Method Tracking:** Categorize accounts by sign-in type: `Google / OAuth`, `Email & Password`, `Phone / SMS`, `Temporary Email`, or `Passkeys / WebAuthn`.
* **Verification Vectors:** Record verification types: `OAuth`, `OTP`, `Password`, `Magic Link`, and `Passkey`.
* **Provider Identity Badges:** Auto-renders visual brand badges and icons for services like Google, GitHub, Apple, Discord, Twitter, and custom URLs.

### 2. 🏥 Security Health Engine
KeyHold runs continuous real-time diagnostic checks across your account ledger:
* **2FA Audit:** Highlights accounts without two-factor authentication enabled.
* **Vulnerability Scorer:** Calculates an overall Health Percentage score based on 2FA adoption, password hygiene, and verification safety.
* **Duplicate Password Detection:** Warns if the same password string is reused across multiple services.
* **Archival Status:** Mark stale accounts as `Active`, `Inactive`, or `Archived` to keep your digital footprint tidy.

### 3. 🎲 Cryptographically Secure Password Generator
* Built on the native Web Crypto API (`window.crypto.getRandomValues`), avoiding predictable pseudorandom math.
* Configurable character sets: Uppercase (`A-Z`), Lowercase (`a-z`), Digits (`0-9`), and Special Symbols (`!@#$%^&*`).
* Avoid ambiguous characters (`l`, `1`, `I`, `O`, `0`) with 1-click preset lengths (12 to 64 characters).

### 4. 🔒 Zero-Trust Privacy Safeguards
* **Auto-Masking:** Passwords and sensitive identifiers are masked by default. Reveal them with a momentary click.
* **Clipboard Auto-Purge:** Automatic background timer purges copied passwords from your operating system clipboard after 15, 30, or 60 seconds.
* **100% Offline-First:** Zero network requests are made. Inspect the network tab—KeyHold functions seamlessly completely disconnected from the internet.

### 5. 🗂️ Flexible View Layouts & Ergonomics
Switch between 3 distinct presentation modes depending on your workflow:
* **Card (Grid) Mode:** Rich cards with category badges, security tags, notes, and visual actions.
* **List (Table) Mode:** Compact table view with sortable columns for fast scanning.
* **Compact (Dense) Mode:** Ultra-dense list layout ideal for large collections of 200+ accounts.

### 6. 🎨 Multi-Palette Theme Engine
Choose from curated themes tailored for day and night:
* Themes: **Slate**, **Obsidian**, **Midnight**, **Forest**, and **Amber**.
* System-aware automatic dark/light theme switching.
* Font scaling adjustments: `Small`, `Medium`, and `Large`.

### 7. ⌨️ Global Command Palette (`⌘K` / `Ctrl+K`)
* Instant keyboard-driven lookup across service names, usernames, tags, and categories.
* Trigger quick actions: Create new account, toggle dark mode, export backup, or audit security health.

### 8. 💾 Portable Backup & Restore
* Full **JSON Export / Import** functionality.
* Easily migrate your encrypted ledger between browsers, machines, or cold storage drives.

---

## 🏗️ Architecture & Data Model

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│                                                             │
│   [User Input] ──► [Input Sanitation & Normalization]        │
│                           │                                 │
│                           ▼                                 │
│        [Security Health Auditor & Strength Evaluator]       │
│                           │                                 │
│          ┌────────────────┴────────────────┐                │
│          ▼                                 ▼                │
│   [State Dispatcher]              [Web Crypto Generator]    │
│          │                                                  │
│          ▼                                                  │
│   [Local Storage Adapter] (Encrypted JSON payload)          │
│          │                                                  │
│          ▼                                                  │
│   [Command Palette (⌘K) & Responsive Multi-Layout Views]    │
└─────────────────────────────────────────────────────────────┘
```

### Account Schema (`src/lib/types.ts`)
```typescript
export interface Account {
  id: string;
  service: string;
  url?: string;
  iconUrl?: string;
  signInMethod: 'gmail' | 'email' | 'phone' | 'tempmail' | 'other';
  identifier?: string;
  verification: 'oauth' | 'otp' | 'password' | 'magiclink' | 'passkey';
  password?: string;
  savePassword: boolean;
  category: string;
  tags: string[];
  notes?: string;
  twoFactor: boolean;
  favorite: boolean;
  status: 'active' | 'inactive' | 'archived';
  username?: string;
  recoveryEmail?: string;
  backupCodes?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 📁 Directory Structure

```text
web/KeyHold/
├── public/                       # Static web icons and manifest assets
├── src/
│   ├── components/               # Accessible modular UI components
│   │   ├── AccountCard.tsx       # Grid card with interactive actions & 2FA badge
│   │   ├── AccountListItem.tsx   # Row item for table and compact view modes
│   │   ├── AccountModal.tsx      # Comprehensive account creation & edit form
│   │   ├── CommandPalette.tsx    # ⌘K instant search & global action dispatcher
│   │   ├── ConfirmDialog.tsx     # Modal confirmation for destructive deletes
│   │   ├── Field.tsx             # Accessible form input & validation wrapper
│   │   ├── SecurityHealth.tsx    # Real-time health scoring & vulnerability report
│   │   ├── ServiceIcon.tsx       # Dynamic brand icon generator with fallbacks
│   │   ├── SettingsPage.tsx      # Theme selector, font scaling, clipboard settings
│   │   ├── StatsBar.tsx          # Quick stat chips (Total, 2FA %, Passwords, Favs)
│   │   └── Toast.tsx             # Micro-interaction notifications
│   ├── lib/                      # Core ledger logic, storage & encryption
│   │   ├── hooks.ts              # Custom React hooks (settings, keyboard listeners)
│   │   ├── meta.tsx              # Icons & metadata for sign-in methods & categories
│   │   ├── store.ts              # LocalStorage CRUD, export/import & password generator
│   │   ├── themes.ts             # Palette definitions (Slate, Midnight, Forest, Amber)
│   │   ├── types.ts              # Strong TypeScript interfaces and schemas
│   │   └── utils.ts              # Styling helpers (clsx/cn) and sanitizers
│   ├── App.tsx                   # Main layout coordinator, filter pipeline & hotkeys
│   ├── index.css                 # Tailwind CSS v4 design tokens and theme variables
│   └── main.tsx                  # React 19 entry point
├── eslint.config.js              # ESLint 9 configuration
├── index.html                    # Single Page Application HTML5 entry point
├── package.json                  # Dependencies and build scripts
├── tsconfig.json                 # TypeScript compiler configuration root
├── tsconfig.app.json             # App-specific TS rules
├── tsconfig.node.json            # Vite/Node configuration
└── vite.config.ts                # Vite 7 build configuration with Tailwind plugin
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** `v20.x` or later
* **Package Manager:** `npm`, `pnpm`, or `bun`

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd /home/code/projects/web/KeyHold
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🛠️ Build & Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the Vite local development server with HMR. |
| `npm run build` | Validates TypeScript types and compiles static bundle into `dist/`. |
| `npm run preview` | Runs a local web server to preview the production build. |
| `npm run lint` | Runs ESLint across all TypeScript and React components. |

---

## ☁️ Deployment

KeyHold is a completely static, zero-backend Single Page Application (SPA). It can be deployed to any static host or CDN in seconds.

### Deploy to Cloudflare Pages via Wrangler

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name keyhold
```

### Deploy to GitHub Pages / Vercel
Simply link the repository to **Vercel** or **GitHub Pages**:
* **Framework:** `Vite`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`

---

## ⌨️ Keyboard Shortcuts

| Key | Description |
|---|---|
| `⌘K` / `Ctrl+K` | Open / Close Command Palette |
| `N` | Open "Add New Account" modal |
| `/` | Focus search bar |
| `Esc` | Close active modal, drawer, or clear search |
| `?` | Toggle keyboard shortcuts guide |

---

## 🔐 Threat Model & Security Principles

* **Zero Network Footprint:** KeyHold does not possess an external API client or analytics beacon. Your credentials never touch the wire.
* **Local Sandboxing:** Data is bound to your browser's origin. Extensions without storage permissions cannot access the ledger.
* **Browser Storage Advisory:** Because data is kept in `localStorage`, clearing your browser history or site data will delete your vault. **Always maintain an exported JSON backup in a secure location.**

---

<div align="center">
  <sub>Take back control of your digital identities with KeyHold.</sub>
</div>
