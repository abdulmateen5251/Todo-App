/**
 * Theme type definitions for the Dark & Light Theme System
 */

/**
 * User's theme selection preference
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Resolved theme currently applied to the UI
 * Always 'light' or 'dark', never 'system'
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * Theme context value provided by ThemeProvider
 */
export interface ThemeContextValue {
  /** Current theme selection (may be 'system') */
  theme: Theme;
  
  /** Resolved theme actually applied ('light' or 'dark') */
  resolvedTheme: ResolvedTheme;
  
  /** Function to update theme selection */
  setTheme: (theme: Theme) => void;
}

/**
 * Theme preference stored in localStorage
 */
export interface ThemePreference {
  /** Selected theme mode */
  theme: Theme;
  
  /** Timestamp of last theme change (ISO 8601 string) */
  updatedAt: string;
}

/**
 * Props for ThemeProvider component
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

/**
 * Props for ThemeToggle component
 */
export interface ThemeToggleProps {
  className?: string;
  iconSize?: number;
  showLabel?: boolean;
}

/**
 * Type guard to check if a value is a valid Theme
 */
export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Type guard to check if a value is a valid ResolvedTheme
 */
export function isResolvedTheme(value: unknown): value is ResolvedTheme {
  return value === 'light' || value === 'dark';
}

/**
 * Type guard to check if a value is a valid ThemePreference
 */
export function isThemePreference(value: unknown): value is ThemePreference {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    isTheme(obj.theme) &&
    typeof obj.updatedAt === 'string'
  );
}

/**
 * Constants
 */
export const DEFAULT_STORAGE_KEY = 'theme' as const;
export const DEFAULT_THEME: Theme = 'light' as const;
