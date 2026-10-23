import { useCallback, useEffect, useState } from 'react';
import type { AppSettings } from './types';
import { loadSettings, saveSettings } from './store';
import { applyThemeColors } from './themes';

/**
 * Central settings hook — reads/writes to localStorage,
 * applies theme colors + font scale to the DOM.
 */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const update = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateAll = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  // Apply theme colors whenever theme/dark changes
  useEffect(() => {
    applyThemeColors(settings.theme, settings.darkMode);
  }, [settings.theme, settings.darkMode]);

  // Apply font scale
  useEffect(() => {
    document.documentElement.setAttribute('data-font-scale', settings.fontSize);
  }, [settings.fontSize]);

  return { settings, update, updateAll } as const;
}
