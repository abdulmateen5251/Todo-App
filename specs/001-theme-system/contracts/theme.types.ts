/**
 * TypeScript Type Contracts for Dark & Light Theme System
 * 
 * This file defines the public API contracts for the theme system.
 * These types should be copied to frontend/src/types/theme.ts during implementation.
 * 
 * @module ThemeContracts
 * @version 1.0.0
 * @created 2026-01-14
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * User's theme selection preference.
 * 
 * @typedef {'light' | 'dark' | 'system'} Theme
 * @property 'light' - Force light mode regardless of system preference
 * @property 'dark' - Force dark mode regardless of system preference
 * @property 'system' - Automatically match OS/browser theme preference
 * 
 * @example
 * const userTheme: Theme = 'dark';
 * const autoTheme: Theme = 'system';
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Resolved theme currently applied to the UI.
 * This is always a concrete theme ('light' or 'dark'), never 'system'.
 * 
 * @typedef {'light' | 'dark'} ResolvedTheme
 * @property 'light' - Light mode is active
 * @property 'dark' - Dark mode is active
 * 
 * @example
 * const currentTheme: ResolvedTheme = 'dark';
 */
export type ResolvedTheme = 'light' | 'dark';

// ============================================================================
// CONTEXT API
// ============================================================================

/**
 * Theme context value provided by ThemeProvider.
 * Consumed via the useTheme() hook.
 * 
 * @interface ThemeContextValue
 * 
 * @example
 * const { theme, resolvedTheme, setTheme } = useTheme();
 * 
 * // Check current theme selection
 * if (theme === 'system') {
 *   console.log('Auto-detecting from OS');
 * }
 * 
 * // Check resolved theme being displayed
 * if (resolvedTheme === 'dark') {
 *   console.log('Dark mode is active');
 * }
 * 
 * // Change theme
 * setTheme('dark');
 */
export interface ThemeContextValue {
  /**
   * Current theme selection (user's choice).
   * May be 'system' if user wants auto-detection.
   */
  theme: Theme;

  /**
   * Resolved theme actually applied to the UI.
   * Always 'light' or 'dark', never 'system'.
   * When theme is 'system', this reflects the detected OS preference.
   */
  resolvedTheme: ResolvedTheme;

  /**
   * Update the theme selection.
   * Triggers re-render and persists to localStorage.
   * 
   * @param newTheme - Theme to switch to
   */
  setTheme: (newTheme: Theme) => void;
}

// ============================================================================
// STORAGE SCHEMA
// ============================================================================

/**
 * Theme preference stored in localStorage.
 * Serialized as JSON under the key 'theme'.
 * 
 * @interface ThemePreference
 * 
 * @example
 * const preference: ThemePreference = {
 *   theme: 'dark',
 *   updatedAt: '2026-01-14T10:30:00.000Z'
 * };
 * localStorage.setItem('theme', JSON.stringify(preference));
 */
export interface ThemePreference {
  /**
   * User's selected theme mode.
   */
  theme: Theme;

  /**
   * ISO 8601 timestamp of when preference was last updated.
   * Used for debugging and potential future analytics.
   */
  updatedAt: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Props for ThemeProvider component.
 * Typically wraps the root layout to provide theme context globally.
 * 
 * @interface ThemeProviderProps
 * 
 * @example
 * <ThemeProvider defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 */
export interface ThemeProviderProps {
  /**
   * Child components that will have access to theme context.
   */
  children: React.ReactNode;

  /**
   * Default theme to use if no preference is stored.
   * @default 'light'
   */
  defaultTheme?: Theme;

  /**
   * localStorage key for storing theme preference.
   * @default 'theme'
   */
  storageKey?: string;
}

/**
 * Props for ThemeToggle component.
 * Renders a button to toggle between light/dark themes.
 * 
 * @interface ThemeToggleProps
 * 
 * @example
 * <ThemeToggle 
 *   className="absolute top-4 right-4"
 *   iconSize={20}
 * />
 */
export interface ThemeToggleProps {
  /**
   * Additional CSS classes to apply to the toggle button.
   */
  className?: string;

  /**
   * Size of the sun/moon icons in pixels.
   * @default 24
   */
  iconSize?: number;

  /**
   * Whether to show text label alongside icon.
   * @default false
   */
  showLabel?: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Configuration for theme system behavior.
 * Used internally by ThemeProvider.
 * 
 * @interface ThemeConfig
 */
export interface ThemeConfig {
  /**
   * Whether to enable transitions when switching themes.
   * @default true
   */
  enableTransitions: boolean;

  /**
   * Transition duration in milliseconds.
   * @default 150
   */
  transitionDuration: number;

  /**
   * Whether to respect prefers-reduced-motion setting.
   * @default true
   */
  respectReducedMotion: boolean;

  /**
   * Attribute to set on document element ('class' or 'data-theme').
   * @default 'class'
   */
  attribute: 'class' | 'data-theme';
}

/**
 * Return type for theme storage operations.
 * Used for error handling in storage utilities.
 * 
 * @interface StorageResult
 */
export interface StorageResult<T> {
  /**
   * Whether the operation succeeded.
   */
  success: boolean;

  /**
   * Data retrieved (for read operations) or undefined.
   */
  data?: T;

  /**
   * Error message if operation failed.
   */
  error?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid Theme.
 * 
 * @param value - Value to check
 * @returns True if value is 'light', 'dark', or 'system'
 * 
 * @example
 * const input: unknown = 'dark';
 * if (isTheme(input)) {
 *   const theme: Theme = input; // Type narrowed
 * }
 */
export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Type guard to check if a value is a valid ResolvedTheme.
 * 
 * @param value - Value to check
 * @returns True if value is 'light' or 'dark'
 * 
 * @example
 * const input: unknown = 'dark';
 * if (isResolvedTheme(input)) {
 *   const resolved: ResolvedTheme = input; // Type narrowed
 * }
 */
export function isResolvedTheme(value: unknown): value is ResolvedTheme {
  return value === 'light' || value === 'dark';
}

/**
 * Type guard to check if a value is a valid ThemePreference.
 * 
 * @param value - Value to check
 * @returns True if value matches ThemePreference structure
 * 
 * @example
 * const stored = JSON.parse(localStorage.getItem('theme') || '{}');
 * if (isThemePreference(stored)) {
 *   const pref: ThemePreference = stored; // Type safe
 * }
 */
export function isThemePreference(value: unknown): value is ThemePreference {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    isTheme(obj.theme) &&
    typeof obj.updatedAt === 'string'
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default theme configuration values.
 * Used when initializing ThemeProvider without explicit config.
 */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  enableTransitions: true,
  transitionDuration: 150,
  respectReducedMotion: true,
  attribute: 'class',
} as const;

/**
 * Default localStorage key for theme preference.
 */
export const DEFAULT_STORAGE_KEY = 'theme' as const;

/**
 * Default theme when no preference is found.
 */
export const DEFAULT_THEME: Theme = 'light' as const;

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Custom event dispatched when theme changes.
 * Can be listened to for side effects outside React.
 * 
 * @example
 * window.addEventListener('themechange', (e) => {
 *   console.log('Theme changed to:', e.detail.resolvedTheme);
 * });
 */
export interface ThemeChangeEvent extends CustomEvent {
  detail: {
    /** Previous theme value */
    previousTheme: Theme;
    /** New theme value */
    currentTheme: Theme;
    /** Previous resolved theme */
    previousResolvedTheme: ResolvedTheme;
    /** New resolved theme */
    currentResolvedTheme: ResolvedTheme;
    /** Timestamp of change */
    timestamp: number;
  };
}

// ============================================================================
// ACCESSIBILITY
// ============================================================================

/**
 * ARIA attributes for theme toggle button.
 * Ensures accessibility compliance.
 */
export interface ThemeToggleAriaAttributes {
  /**
   * Label announced by screen readers.
   * Should describe current state and action.
   */
  'aria-label': string;

  /**
   * Indicates current pressed state of toggle.
   * True when dark mode is active.
   */
  'aria-pressed': boolean;

  /**
   * Role for accessibility tree.
   * @default 'button'
   */
  role?: 'button' | 'switch';
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Re-export all types for convenience.
 */
export type {
  Theme,
  ResolvedTheme,
  ThemeContextValue,
  ThemePreference,
  ThemeProviderProps,
  ThemeToggleProps,
  ThemeConfig,
  StorageResult,
  ThemeChangeEvent,
  ThemeToggleAriaAttributes,
};

/**
 * Re-export constants.
 */
export {
  DEFAULT_THEME_CONFIG,
  DEFAULT_STORAGE_KEY,
  DEFAULT_THEME,
};

/**
 * Re-export type guards.
 */
export {
  isTheme,
  isResolvedTheme,
  isThemePreference,
};
