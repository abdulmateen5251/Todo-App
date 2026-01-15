# Data Model: Dark & Light Theme System

**Feature**: 001-theme-system  
**Created**: January 14, 2026  
**Purpose**: Define data structures, state management, and storage schema for theme system

## Overview

The theme system manages a simple state model with three core concepts:
1. **Theme Selection** - User's chosen theme mode ('light', 'dark', or 'system')
2. **Resolved Theme** - The actual theme being displayed ('light' or 'dark')
3. **Theme Preference** - Persisted user preference in localStorage

This document defines TypeScript interfaces, state transitions, and storage schema.

---

## Type Definitions

### Core Types

```typescript
/**
 * User's theme selection
 * - 'light': Force light mode
 * - 'dark': Force dark mode  
 * - 'system': Auto-detect from OS preference
 */
type Theme = 'light' | 'dark' | 'system';

/**
 * Resolved theme currently applied to UI
 * Always resolves to 'light' or 'dark' (never 'system')
 */
type ResolvedTheme = 'light' | 'dark';

/**
 * Theme context value exposed to consuming components
 */
interface ThemeContextValue {
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
interface ThemePreference {
  /** Selected theme mode */
  theme: Theme;
  
  /** Timestamp of last theme change (ISO 8601 string) */
  updatedAt: string;
}
```

### Storage Schema

```typescript
/**
 * localStorage key-value schema
 */
interface ThemeStorage {
  /** Key: 'theme' | Value: Serialized ThemePreference JSON */
  theme: string; // JSON.stringify(ThemePreference)
}

/**
 * Example localStorage entry:
 * {
 *   "theme": "{\"theme\":\"dark\",\"updatedAt\":\"2026-01-14T10:30:00.000Z\"}"
 * }
 */
```

---

## State Management

### Context State

The `ThemeContext` maintains internal state:

```typescript
interface ThemeContextState {
  /** User's selected theme (persisted to localStorage) */
  theme: Theme;
  
  /** Computed theme actually displayed in UI */
  resolvedTheme: ResolvedTheme;
  
  /** OS system preference detected via matchMedia */
  systemTheme: ResolvedTheme;
}
```

### State Initialization

```typescript
/**
 * Theme state initialization logic (on app load)
 */
function initializeTheme(): ThemeContextState {
  // 1. Check localStorage for stored preference
  const stored = getStoredPreference();
  
  // 2. Detect OS system preference
  const systemTheme = getSystemPreference();
  
  // 3. Determine initial theme
  const theme: Theme = stored?.theme ?? 'system';
  
  // 4. Resolve to concrete theme
  const resolvedTheme: ResolvedTheme = 
    theme === 'system' ? systemTheme : theme;
  
  return { theme, resolvedTheme, systemTheme };
}
```

---

## State Transitions

### Transition Rules

1. **User toggles theme manually**
   ```
   Current: { theme: 'light', resolvedTheme: 'light' }
   Action: setTheme('dark')
   Result: { theme: 'dark', resolvedTheme: 'dark' }
   Side Effect: Save to localStorage, apply .dark class to <html>
   ```

2. **User selects 'system' mode**
   ```
   Current: { theme: 'dark', resolvedTheme: 'dark', systemTheme: 'light' }
   Action: setTheme('system')
   Result: { theme: 'system', resolvedTheme: 'light' }
   Side Effect: Save to localStorage, apply .light class to <html>
   ```

3. **OS preference changes (while in system mode)**
   ```
   Current: { theme: 'system', resolvedTheme: 'light', systemTheme: 'light' }
   Action: OS changes to dark mode (mediaQuery event)
   Result: { theme: 'system', resolvedTheme: 'dark', systemTheme: 'dark' }
   Side Effect: Apply .dark class to <html> (no localStorage write)
   ```

4. **OS preference changes (while in manual mode)**
   ```
   Current: { theme: 'dark', resolvedTheme: 'dark', systemTheme: 'light' }
   Action: OS changes to dark mode (mediaQuery event)
   Result: { theme: 'dark', resolvedTheme: 'dark', systemTheme: 'dark' }
   Side Effect: None (manual preference overrides OS)
   ```

### State Transition Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Theme State Machine                   │
└─────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   Initial    │
                    │   App Load   │
                    └──────┬───────┘
                           │
                           ▼
                  ┌────────────────────┐
                  │  Read localStorage │
                  │  Detect OS Theme   │
                  └────────┬───────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
      ┌─────────┐    ┌──────────┐   ┌────────┐
      │ Stored  │    │  System  │   │ Default│
      │  Dark   │    │   Auto   │   │  Light │
      └────┬────┘    └─────┬────┘   └───┬────┘
           │               │            │
           └───────────────┼────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  User Clicks │
                    │    Toggle    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Cycle Themes │
                    │ light→dark   │
                    │ dark→light   │
                    └──────┬───────┘
                           │
                           ▼
                  ┌────────────────────┐
                  │  Update Context    │
                  │  Save localStorage │
                  │  Apply CSS Class   │
                  └────────────────────┘
```

---

## Storage Operations

### Read Operations

```typescript
/**
 * Get theme preference from localStorage
 * Returns null if not found or invalid
 */
function getStoredPreference(): ThemePreference | null {
  try {
    const stored = localStorage.getItem('theme');
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Validate structure
    if (!isValidTheme(parsed.theme)) return null;
    if (typeof parsed.updatedAt !== 'string') return null;
    
    return parsed as ThemePreference;
  } catch {
    // Invalid JSON or localStorage unavailable
    return null;
  }
}

/**
 * Detect OS system preference
 */
function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'light';
}
```

### Write Operations

```typescript
/**
 * Save theme preference to localStorage
 */
function saveThemePreference(theme: Theme): void {
  try {
    const preference: ThemePreference = {
      theme,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('theme', JSON.stringify(preference));
  } catch (error) {
    // localStorage unavailable (private browsing, quota exceeded)
    console.warn('Failed to persist theme preference:', error);
    // Continue without persistence (in-memory only)
  }
}
```

### Validation

```typescript
/**
 * Type guard for Theme values
 */
function isValidTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Type guard for ResolvedTheme values
 */
function isValidResolvedTheme(value: unknown): value is ResolvedTheme {
  return value === 'light' || value === 'dark';
}
```

---

## Color Token Schema

### CSS Custom Properties

Theme colors are defined as CSS custom properties (variables) in `globals.css`:

```css
/* Light theme (default) */
:root {
  --color-background: #FFFFFF;
  --color-surface: #F1F5F9;
  --color-primary: #4F46E5;
  --color-secondary: #22D3EE;
  --color-text: #111827;
  --color-text-muted: #6B7280;
}

/* Dark theme (when .dark class applied to <html>) */
.dark {
  --color-background: #0B0F1A;
  --color-surface: #1E293B;
  --color-primary: #4F46E5;
  --color-secondary: #22D3EE;
  --color-text: #E5E7EB;
  --color-text-muted: #9CA3AF;
}
```

### Tailwind Color Mapping

Tailwind config maps utility classes to CSS variables:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
      }
    }
  }
}
```

**Usage in Components:**
```tsx
<div className="bg-background text-text">
  <h1 className="text-primary">Hello</h1>
  <p className="text-text-muted">Subtitle</p>
</div>
```

---

## Validation Rules

### Type Safety Rules

1. **Theme Selection Validation**
   - MUST be one of: 'light', 'dark', 'system'
   - Invalid values default to 'light'
   - Stored preferences are validated on read

2. **Resolved Theme Validation**
   - MUST be one of: 'light', 'dark'
   - Never 'system' (always resolved to concrete value)

3. **localStorage Data Validation**
   - JSON parse errors → fall back to default
   - Invalid theme value → fall back to default
   - Missing timestamp → use current time

### Business Rules

1. **Preference Priority**
   - Manual selection > localStorage > OS preference > Default
   - Manual preference MUST override OS preference changes
   - localStorage failure MUST NOT block theme functionality

2. **State Consistency**
   - `resolvedTheme` MUST always match `theme` (unless theme === 'system')
   - CSS class on `<html>` MUST match `resolvedTheme`
   - localStorage MUST be updated within same event loop as state change

---

## Entity Relationships

```
┌─────────────────┐
│  ThemeContext   │
│  (React State)  │
└────────┬────────┘
         │
         │ manages
         │
         ▼
┌─────────────────────────────────┐
│      Theme State                │
│  ┌─────────────────────────┐   │
│  │ theme: Theme            │   │
│  │ resolvedTheme: Resolved │   │
│  │ systemTheme: Resolved   │   │
│  └─────────────────────────┘   │
└────┬────────────────────┬───────┘
     │                    │
     │ persists to        │ reads from
     │                    │
     ▼                    ▼
┌─────────────────┐   ┌──────────────────┐
│  localStorage   │   │  OS matchMedia   │
│  'theme' key    │   │  prefers-color   │
└─────────────────┘   └──────────────────┘
     │
     │ applies to
     │
     ▼
┌─────────────────┐
│  <html> element │
│  .dark class    │
└─────────────────┘
```

---

## Migration & Versioning

### Current Version: 1.0

**localStorage Schema Version**: `1.0`

```typescript
// V1 Schema (current)
interface ThemePreferenceV1 {
  theme: Theme;
  updatedAt: string;
}
```

### Future Considerations

If theme preferences need to evolve (e.g., adding custom themes), migration strategy:

1. Add `version` field to stored preference
2. Read and migrate old format on load
3. Maintain backward compatibility for at least one major version

```typescript
// Example future migration
interface ThemePreferenceV2 {
  version: '2.0';
  theme: Theme;
  customColors?: Record<string, string>;
  updatedAt: string;
}

function migrateThemePreference(stored: unknown): ThemePreferenceV2 {
  // Migration logic here
}
```

---

## Summary

**Entities Defined:**
- ✅ Theme types: `Theme`, `ResolvedTheme`
- ✅ Context interface: `ThemeContextValue`
- ✅ Storage schema: `ThemePreference`
- ✅ Color tokens: CSS custom properties
- ✅ State transitions: User actions, OS changes

**Validation Rules:**
- ✅ Type guards for theme values
- ✅ localStorage error handling
- ✅ Preference priority order

**Storage Operations:**
- ✅ Read from localStorage with fallback
- ✅ Write to localStorage with error handling
- ✅ OS preference detection

**Ready for implementation** - All data structures, state transitions, and validation rules are fully specified.
