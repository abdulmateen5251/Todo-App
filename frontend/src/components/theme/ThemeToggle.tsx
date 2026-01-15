'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeToggleProps } from '@/types/theme';

/**
 * ThemeToggle component - renders a button to toggle between light and dark themes
 * 
 * Accessibility Features:
 * - Icon-based toggle with sun/moon icons from lucide-react
 * - Keyboard accessible: activates on Enter/Space (native button behavior)
 * - ARIA attributes for screen readers:
 *   - aria-label: Descriptive toggle action ("Switch to dark/light mode")
 *   - role="switch": Semantic role for assistive technologies
 *   - aria-checked: Current state (true when dark mode is active)
 *   - aria-pressed: Alternate state indicator for toggle buttons
 * - Focus styles: Visible focus ring (ring-2 ring-primary) for keyboard navigation
 * - Respects prefers-reduced-motion: Transitions disabled via globals.css media query
 * 
 * Usage:
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle iconSize={24} showLabel />
 * <ThemeToggle className="custom-class" />
 * ```
 * 
 * Props:
 * - className?: Additional CSS classes for custom styling
 * - iconSize?: Icon size in pixels (default: 20)
 * - showLabel?: Whether to show text label next to icon (default: false)
 */
export function ThemeToggle({ 
  className = '', 
  iconSize = 20,
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Toggle between light and dark (skip 'system' for simple toggle)
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const label = `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`;

  return (
    <button
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={resolvedTheme === 'dark'}
      role="switch"
      aria-checked={resolvedTheme === 'dark'}
      className={`
        inline-flex items-center gap-2 
        p-2 rounded-lg
        transition-colors duration-200
        hover:bg-surface
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        focus:ring-offset-background
        ${className}
      `}
      type="button"
    >
      {resolvedTheme === 'dark' ? (
        <Sun size={iconSize} className="text-text" />
      ) : (
        <Moon size={iconSize} className="text-text" />
      )}
      {showLabel && (
        <span className="text-sm font-medium text-text">
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
