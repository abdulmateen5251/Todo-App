'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme, ResolvedTheme, ThemeContextValue, ThemeProviderProps } from '@/types/theme';
import { 
  getStoredPreference, 
  saveThemePreference, 
  getSystemPreference, 
  resolveTheme,
  applyThemeClass 
} from '@/lib/theme-utils';
import { DEFAULT_STORAGE_KEY } from '@/types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = DEFAULT_STORAGE_KEY 
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const stored = getStoredPreference(storageKey);
    const system = getSystemPreference();
    
    setSystemTheme(system);
    
    const initialTheme: Theme = stored?.theme ?? defaultTheme;
    setThemeState(initialTheme);
    
    // Apply initial theme
    const resolved = resolveTheme(initialTheme, system);
    applyThemeClass(resolved);
    
    setMounted(true);
  }, [defaultTheme, storageKey]);

  // Listen for OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme: ResolvedTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      // Only update UI if theme is set to 'system'
      if (theme === 'system') {
        applyThemeClass(newSystemTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!mounted) return;
    
    const resolved = resolveTheme(theme, systemTheme);
    applyThemeClass(resolved);
  }, [theme, systemTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveThemePreference(newTheme, storageKey);
  };

  const resolvedTheme = resolveTheme(theme, systemTheme);

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    // During SSR/build time, provide safe defaults
    if (typeof window === 'undefined') {
      return {
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: () => {},
      };
    }
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
