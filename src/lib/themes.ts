export interface ThemeColors {
  paper: string;
  card: string;
  panel: string;
  ink: string;
  muted: string;
  line: string;
  brand: string;
  brandSoft: string;
  brandDeep: string;
  amber: string;
  rose: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  colors: { light: ThemeColors; dark: ThemeColors };
}

export const THEMES: ThemeDefinition[] = [
  /* ──── 1. Ivory Sand (default) ──── */
  {
    id: 'ivory-sand',
    name: 'Ivory Sand',
    description: 'Warm cream with forest green',
    colors: {
      light: {
        paper: '#f4f1e9', card: '#fffdf8', panel: '#ebe7db',
        ink: '#1b211d', muted: '#6d7269', line: '#e0dbcd',
        brand: '#0e7c5a', brandSoft: '#dcefe6', brandDeep: '#0a5c43',
        amber: '#bb6a34', rose: '#b23b2e',
      },
      dark: {
        paper: '#12140f', card: '#1a1d17', panel: '#23271f',
        ink: '#ecebe0', muted: '#9aa094', line: '#2d3128',
        brand: '#33b389', brandSoft: '#16281f', brandDeep: '#4ccb9f',
        amber: '#d08a52', rose: '#e0715f',
      },
    },
  },

  /* ──── 2. Arctic Blue ──── */
  {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    description: 'Cool ice with steel blue',
    colors: {
      light: {
        paper: '#f0f4f8', card: '#ffffff', panel: '#e2e8f0',
        ink: '#1a2332', muted: '#64748b', line: '#d5dde6',
        brand: '#2563b3', brandSoft: '#dbeafe', brandDeep: '#1d4b8f',
        amber: '#c97b2a', rose: '#c43b3b',
      },
      dark: {
        paper: '#0d1117', card: '#161b22', panel: '#21262d',
        ink: '#e6edf3', muted: '#8b949e', line: '#30363d',
        brand: '#58a6ff', brandSoft: '#0d2744', brandDeep: '#79c0ff',
        amber: '#d29922', rose: '#f85149',
      },
    },
  },

  /* ──── 3. Forest Canopy ──── */
  {
    id: 'forest-canopy',
    name: 'Forest Canopy',
    description: 'Sage greens with emerald',
    colors: {
      light: {
        paper: '#eef3ee', card: '#f8faf8', panel: '#dfe8df',
        ink: '#1a261e', muted: '#5e7162', line: '#cfd9cf',
        brand: '#2d6a4f', brandSoft: '#d8ede2', brandDeep: '#1b4332',
        amber: '#b07730', rose: '#b33a3a',
      },
      dark: {
        paper: '#0b150e', card: '#132218', panel: '#1c3022',
        ink: '#ddeee4', muted: '#7ea68a', line: '#243d2c',
        brand: '#52b788', brandSoft: '#142e20', brandDeep: '#74d4a4',
        amber: '#d4944e', rose: '#e06b60',
      },
    },
  },

  /* ──── 4. Slate Mono ──── */
  {
    id: 'slate-mono',
    name: 'Slate Mono',
    description: 'Minimal monochrome',
    colors: {
      light: {
        paper: '#f3f4f6', card: '#ffffff', panel: '#e5e7eb',
        ink: '#111827', muted: '#6b7280', line: '#d1d5db',
        brand: '#4b5563', brandSoft: '#e5e7eb', brandDeep: '#374151',
        amber: '#b27e2a', rose: '#be3434',
      },
      dark: {
        paper: '#111318', card: '#1a1d24', panel: '#252830',
        ink: '#e5e7eb', muted: '#9ca3af', line: '#374151',
        brand: '#9ca3af', brandSoft: '#1f2937', brandDeep: '#d1d5db',
        amber: '#d4a043', rose: '#ef5555',
      },
    },
  },

  /* ──── 5. Coral Reef ──── */
  {
    id: 'coral-reef',
    name: 'Coral Reef',
    description: 'Warm coral and salmon',
    colors: {
      light: {
        paper: '#fdf4f1', card: '#fffaf8', panel: '#f5e6df',
        ink: '#2d1810', muted: '#8b6e62', line: '#ead8cf',
        brand: '#d4634a', brandSoft: '#fde8e2', brandDeep: '#b04a33',
        amber: '#c08030', rose: '#c23535',
      },
      dark: {
        paper: '#170e0b', card: '#221714', panel: '#2e201b',
        ink: '#f0ddd7', muted: '#b09085', line: '#3d2c24',
        brand: '#e8806a', brandSoft: '#2d1a14', brandDeep: '#f4a090',
        amber: '#d49050', rose: '#f06055',
      },
    },
  },

  /* ──── 6. Ocean Mist ──── */
  {
    id: 'ocean-mist',
    name: 'Ocean Mist',
    description: 'Fresh teal and aqua',
    colors: {
      light: {
        paper: '#eef5f5', card: '#f7fcfc', panel: '#dbe9e9',
        ink: '#142424', muted: '#577272', line: '#c8dcdc',
        brand: '#0d8a8a', brandSoft: '#d2eeee', brandDeep: '#086868',
        amber: '#b87730', rose: '#b43a3a',
      },
      dark: {
        paper: '#0b1414', card: '#122020', panel: '#1a2d2d',
        ink: '#d5eded', muted: '#7daaaa', line: '#243838',
        brand: '#3abfbf', brandSoft: '#0f2525', brandDeep: '#5dd4d4',
        amber: '#d09040', rose: '#e06060',
      },
    },
  },

  /* ──── 7. Champagne Gold ──── */
  {
    id: 'champagne-gold',
    name: 'Champagne Gold',
    description: 'Rich gold and ivory',
    colors: {
      light: {
        paper: '#f8f4ee', card: '#fffcf5', panel: '#eee7d8',
        ink: '#2a2318', muted: '#8a7e6a', line: '#e0d5c2',
        brand: '#b8860b', brandSoft: '#f5ecd4', brandDeep: '#8c6508',
        amber: '#c07828', rose: '#b03030',
      },
      dark: {
        paper: '#14110a', card: '#1e1a11', panel: '#2a2418',
        ink: '#ede5d5', muted: '#a89c85', line: '#3a3225',
        brand: '#d4a843', brandSoft: '#28200e', brandDeep: '#e8c060',
        amber: '#d09540', rose: '#e06555',
      },
    },
  },

  /* ──── 8. Graphite ──── */
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'Industrial neutral steel',
    colors: {
      light: {
        paper: '#f0f1f3', card: '#f9fafb', panel: '#e3e5e8',
        ink: '#1c1f24', muted: '#666d78', line: '#d3d6db',
        brand: '#505a68', brandSoft: '#e0e3e8', brandDeep: '#3a424e',
        amber: '#b07828', rose: '#b83535',
      },
      dark: {
        paper: '#101114', card: '#181a1e', panel: '#22252a',
        ink: '#dfe1e5', muted: '#8a8f98', line: '#2e3138',
        brand: '#8b95a5', brandSoft: '#1e2228', brandDeep: '#b0b8c5',
        amber: '#d09040', rose: '#e86060',
      },
    },
  },

  /* ──── 9. Rose Ash ──── */
  {
    id: 'rose-ash',
    name: 'Rose Ash',
    description: 'Soft dusty rose',
    colors: {
      light: {
        paper: '#f8f0f2', card: '#fefafb', panel: '#eddfe3',
        ink: '#2a1a1f', muted: '#8a6e75', line: '#e2d2d8',
        brand: '#b05a6a', brandSoft: '#f5e0e5', brandDeep: '#8c3f50',
        amber: '#b87830', rose: '#c03535',
      },
      dark: {
        paper: '#160e11', card: '#201518', panel: '#2c2024',
        ink: '#f0e0e5', muted: '#a58890', line: '#3a282e',
        brand: '#d4889a', brandSoft: '#281518', brandDeep: '#e8a5b5',
        amber: '#d09050', rose: '#e86060',
      },
    },
  },

  /* ──── 10. Olive Linen ──── */
  {
    id: 'olive-linen',
    name: 'Olive Linen',
    description: 'Earthy olive and linen',
    colors: {
      light: {
        paper: '#f4f2eb', card: '#fdfcf5', panel: '#e8e4d8',
        ink: '#22240e', muted: '#747858', line: '#ddd9ca',
        brand: '#6b7c3e', brandSoft: '#e5ebd0', brandDeep: '#4d5a28',
        amber: '#b8782a', rose: '#b03535',
      },
      dark: {
        paper: '#11120b', card: '#1a1c13', panel: '#24261c',
        ink: '#e6e8d8', muted: '#97a078', line: '#2e3124',
        brand: '#99ad5b', brandSoft: '#1e2414', brandDeep: '#b4c578',
        amber: '#d09040', rose: '#e06060',
      },
    },
  },

  /* ──── 11. Peach Cream ──── */
  {
    id: 'peach-cream',
    name: 'Peach Cream',
    description: 'Warm peach and terracotta',
    colors: {
      light: {
        paper: '#fdf4ed', card: '#fffaf5', panel: '#f2e5d8',
        ink: '#2a1e15', muted: '#8e7565', line: '#e8d8c8',
        brand: '#c96d3b', brandSoft: '#fce4d2', brandDeep: '#a05228',
        amber: '#bb7828', rose: '#b83535',
      },
      dark: {
        paper: '#16100b', card: '#211812', panel: '#2d221a',
        ink: '#f0e2d5', muted: '#ab9080', line: '#3d2e22',
        brand: '#e09060', brandSoft: '#28180e', brandDeep: '#f0a878',
        amber: '#d09550', rose: '#e06060',
      },
    },
  },

  /* ──── 12. Mint Glass ──── */
  {
    id: 'mint-glass',
    name: 'Mint Glass',
    description: 'Fresh mint and turquoise',
    colors: {
      light: {
        paper: '#edf6f3', card: '#f5fcfa', panel: '#dbe9e4',
        ink: '#142820', muted: '#5a7a6e', line: '#c8ddd4',
        brand: '#1a9e7a', brandSoft: '#d0f0e4', brandDeep: '#127558',
        amber: '#b87a30', rose: '#b43838',
      },
      dark: {
        paper: '#0a1410', card: '#121f1a', panel: '#1a2e25',
        ink: '#d5ede5', muted: '#7daa98', line: '#243a30',
        brand: '#40c9a2', brandSoft: '#102820', brandDeep: '#60ddb5',
        amber: '#d09050', rose: '#e06060',
      },
    },
  },
];

/** Apply a theme's colors to the document root. */
export function applyThemeColors(themeId: string, isDark: boolean): void {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const c = isDark ? theme.colors.dark : theme.colors.light;
  const root = document.documentElement;

  // Enable smooth transition
  root.classList.add('theme-transitioning');

  root.style.setProperty('--paper', c.paper);
  root.style.setProperty('--card', c.card);
  root.style.setProperty('--panel', c.panel);
  root.style.setProperty('--ink', c.ink);
  root.style.setProperty('--muted', c.muted);
  root.style.setProperty('--line', c.line);
  root.style.setProperty('--brand', c.brand);
  root.style.setProperty('--brand-soft', c.brandSoft);
  root.style.setProperty('--brand-deep', c.brandDeep);
  root.style.setProperty('--amber', c.amber);
  root.style.setProperty('--rose', c.rose);

  root.classList.toggle('dark', isDark);

  setTimeout(() => root.classList.remove('theme-transitioning'), 400);
}
