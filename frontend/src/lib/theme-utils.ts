import type { Theme, ResolvedTheme, ThemePreference } from '@/types/theme';
import { isTheme, isThemePreference } from '@/types/theme';

/**
 * Get theme preference from localStorage
 * Returns null if not found or invalid
 */
export function getStoredPreference(storageKey: string = 'theme'): ThemePreference | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    if (!isThemePreference(parsed)) return null;
    
    return parsed;
  } catch {
    // Invalid JSON or localStorage unavailable
    return null;
  }
}

/**
 * Save theme preference to localStorage
 */
export function saveThemePreference(theme: Theme, storageKey: string = 'theme'): void {
  if (typeof window === 'undefined') return;
  
  try {
    const preference: ThemePreference = {
      theme,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(storageKey, JSON.stringify(preference));
  } catch (error) {
    // localStorage unavailable (private browsing, quota exceeded)
    console.warn('Failed to persist theme preference:', error);
    // Continue without persistence (in-memory only)
  }
}

/**
 * Detect OS system preference
 */
export function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'light';
}

/**
 * Resolve theme to concrete 'light' or 'dark' value
 */
export function resolveTheme(theme: Theme, systemTheme: ResolvedTheme): ResolvedTheme {
  return theme === 'system' ? systemTheme : theme;
}

/**
 * Apply theme class to document element
 */
export function applyThemeClass(resolvedTheme: ResolvedTheme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove both classes first
  root.classList.remove('light', 'dark');
  
  // Add the current theme class
  root.classList.add(resolvedTheme);
}
