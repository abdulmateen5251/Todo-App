'use client';

import { useTheme as useThemeContext } from '@/contexts/ThemeContext';

/**
 * Re-export useTheme from ThemeContext for convenience
 * Must be used within a ThemeProvider
 */
export function useTheme() {
  return useThemeContext();
}
