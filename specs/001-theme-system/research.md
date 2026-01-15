# Research: Dark & Light Theme System

**Feature**: 001-theme-system  
**Created**: January 14, 2026  
**Purpose**: Document research findings, technology decisions, and best practices for implementing the theme system

## Research Questions from Technical Context

### 1. Theme State Management Pattern

**Question**: What is the best practice for managing theme state in Next.js App Router applications?

**Research Findings**:
- **React Context API** is the recommended approach for global theme state in Next.js 14+ App Router
- Context provides clean prop-drilling avoidance and works seamlessly with Server/Client components
- Alternative solutions (Zustand, Redux) add unnecessary complexity for this use case

**Decision**: Use React Context API with `'use client'` directive

**Rationale**:
- Native React solution, no additional dependencies
- Excellent TypeScript support
- Follows existing project patterns (see `frontend/src/contexts/`)
- Context is appropriate for theme state: truly global, changes infrequently, read by many components

**Alternatives Considered**:
- Zustand: Overkill for simple theme state; adds dependency
- Redux: Too complex for this use case
- Props drilling: Unmaintainable at scale
- CSS-only (no JS): Cannot persist user preference or detect OS setting

---

### 2. Preventing Flash of Unstyled Content (FOUC)

**Question**: How do we prevent the wrong theme from showing briefly on page load in Next.js?

**Research Findings**:
- FOUC occurs when JS loads after initial HTML render, causing theme flicker
- **Blocking script** in `<head>` must run before first paint to set theme class
- Script must read localStorage synchronously before React hydration
- Next.js App Router requires careful handling of Server/Client component boundaries

**Decision**: Inject inline blocking script in root layout before React hydration

**Rationale**:
- Synchronous script in `<head>` executes before DOM render
- Sets `data-theme` or `class` attribute on `<html>` element immediately
- CSS can reference this attribute for instant theme application
- No flicker because theme is set before first paint

**Implementation Pattern**:
```tsx
// app/layout.tsx
<html suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{
      __html: `
        (function() {
          const theme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          document.documentElement.classList.add(theme);
        })();
      `
    }} />
  </head>
  {/* ... */}
</html>
```

**Alternatives Considered**:
- CSS media queries only: Can't persist manual preference
- useEffect after mount: Causes visible flicker
- Server-side rendering: Can't access browser storage or OS preference
- next-themes library: Adds dependency when custom solution is simple

---

### 3. Tailwind CSS Dark Mode Configuration

**Question**: What's the best configuration for Tailwind dark mode with our color tokens?

**Research Findings**:
- Tailwind supports two dark mode strategies: `media` (CSS media query) or `class` (className toggle)
- **`class` strategy** is superior for manual toggle + system preference combo
- CSS custom properties enable runtime theme switching with Tailwind utilities
- Project already has `darkMode: 'class'` configured in `tailwind.config.js`

**Decision**: Use Tailwind `class` strategy with CSS variables for color tokens

**Rationale**:
- `class` mode allows manual override of system preference (required by FR-005)
- CSS variables provide single source of truth for theme colors
- Tailwind utilities automatically reference CSS variables
- Enables smooth transitions between themes

**Implementation Pattern**:
```css
/* globals.css */
:root {
  --color-background: #FFFFFF;
  --color-surface: #F1F5F9;
  --color-primary: #4F46E5;
  --color-text: #111827;
}

.dark {
  --color-background: #0B0F1A;
  --color-surface: #1E293B;
  --color-primary: #4F46E5;
  --color-text: #E5E7EB;
}
```

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        // ...
      }
    }
  }
}
```

**Alternatives Considered**:
- `media` strategy: Can't manually override OS preference
- Duplicate color definitions: DRY violation, maintenance burden
- Inline styles: Poor performance, no Tailwind utility classes
- PostCSS theme plugin: Unnecessary complexity

---

### 4. OS Preference Detection Best Practices

**Question**: How should we reliably detect and respond to OS theme preference changes?

**Research Findings**:
- `window.matchMedia('(prefers-color-scheme: dark)')` is the standard API
- Media query listener (`addListener` or `addEventListener`) detects runtime OS changes
- Initial detection must happen in blocking script (see FOUC research)
- React component must sync with media query changes via useEffect

**Decision**: Use matchMedia API with event listener for dynamic OS preference tracking

**Rationale**:
- Native browser API, excellent support (Chrome 76+, Firefox 67+, Safari 12.1+)
- Provides both initial state and change events
- Respects user's OS-level accessibility settings
- No polling required, event-driven updates

**Implementation Pattern**:
```tsx
// In ThemeProvider
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    if (theme === 'system') {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, [theme]);
```

**Alternatives Considered**:
- CSS media queries only: Can't persist manual choice
- Polling: Inefficient, unnecessary battery drain
- Server-side detection: Impossible, OS preference is client-only
- Third-party libraries: Adds dependency for simple API

---

### 5. Accessibility Best Practices for Theme Toggles

**Question**: What are WCAG-compliant patterns for theme toggle controls?

**Research Findings**:
- Toggle must be keyboard accessible (Enter/Space to activate)
- Screen readers must announce current state and changes
- Focus indicators must be visible in both themes
- Color alone cannot convey state (must use icon + text or ARIA label)
- ARIA attributes: `aria-label`, `aria-pressed` (for toggle buttons), or `role="switch"` with `aria-checked`

**Decision**: Implement toggle button with proper ARIA attributes and keyboard support

**Rationale**:
- Button element provides native keyboard support
- ARIA labels announce state to screen readers
- Icon changes (sun/moon) provide visual feedback
- Meets WCAG 2.1 Level AA requirements (guideline 2.1.1, 4.1.2)

**Implementation Pattern**:
```tsx
<button
  onClick={toggleTheme}
  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
  aria-pressed={theme === 'dark'}
  className="focus:ring-2 focus:ring-primary"
>
  {theme === 'dark' ? <Sun /> : <Moon />}
</button>
```

**Alternatives Considered**:
- Checkbox: Not semantically appropriate for theme toggle
- Switch component: Requires more complex ARIA implementation
- Icon-only button: Fails accessibility without ARIA label
- Text-only toggle: Works but less common UX pattern

---

### 6. localStorage Graceful Degradation

**Question**: How should we handle localStorage being unavailable (private browsing, disabled, quota exceeded)?

**Research Findings**:
- `localStorage.setItem()` can throw exceptions in private browsing modes (Safari, Firefox)
- Some browsers disable localStorage entirely via settings
- Quota exceeded errors can occur (rare but possible)
- Graceful fallback should use OS preference or default theme

**Decision**: Wrap localStorage access in try-catch with fallback to memory-only storage

**Rationale**:
- Prevents crashes in edge cases
- Provides degraded but functional experience
- Maintains theme state during session even without persistence
- Aligns with progressive enhancement principles

**Implementation Pattern**:
```tsx
function getStoredTheme(): Theme | null {
  try {
    return localStorage.getItem('theme') as Theme | null;
  } catch {
    return null; // Fallback: use OS preference or default
  }
}

function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Silent failure: theme works in-session but won't persist
    console.warn('Failed to persist theme preference');
  }
}
```

**Alternatives Considered**:
- Assume localStorage always works: Causes crashes in edge cases
- IndexedDB fallback: Overkill for simple key-value storage
- Cookie storage: Adds HTTP overhead, size limitations
- No fallback: Poor user experience in private browsing

---

### 7. Performance Optimization for Theme Transitions

**Question**: How can we ensure smooth 60fps theme transitions without layout shift?

**Research Findings**:
- CSS transitions should target `color`, `background-color`, `border-color` only (paintable properties)
- Avoid transitioning `width`, `height`, or other layout properties (causes reflow)
- `will-change` hints can improve performance but use sparingly (memory cost)
- `prefers-reduced-motion` media query must disable transitions for accessibility

**Decision**: Use CSS transitions on color properties with reduced-motion support

**Rationale**:
- Color transitions are GPU-accelerated in modern browsers
- No layout thrashing or reflow
- Respects user motion preferences (WCAG 2.1 guideline 2.3.3)
- Clean separation of concerns (CSS handles visual transitions)

**Implementation Pattern**:
```css
/* globals.css */
* {
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
  transition-timing-function: ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0ms;
  }
}
```

**Alternatives Considered**:
- JavaScript-based animations: More complex, poorer performance
- Framer Motion: Already in dependencies but overkill for theme transitions
- No transitions: Jarring user experience
- Transition all properties: Causes layout shift and poor performance

---

## Technology Stack Summary

### Selected Technologies

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| State Management | React Context API | React 18.2+ | Native, simple, sufficient for global theme state |
| Styling Framework | Tailwind CSS | 3.3+ | Already in project, excellent dark mode support |
| Type Safety | TypeScript | 5.3+ | Project standard, prevents theme state bugs |
| Icons | lucide-react | Latest | Already in project (`package.json`), provides sun/moon icons |
| Storage | localStorage API | Native | Standard for client-side persistence |
| Testing | Jest + RTL | Latest | Project standard for React component testing |

### Dependencies Required

**No new dependencies needed** - Feature uses existing project dependencies:
- React 18.2 (already installed)
- Next.js 14.0 (already installed)
- Tailwind CSS 3.3 (already installed)
- TypeScript 5.3 (already installed)
- lucide-react (already installed)

---

## Best Practices & Patterns

### 1. Theme Precedence Order
```
1. Manual user selection (highest priority)
2. Stored localStorage preference
3. OS system preference (matchMedia)
4. Default theme (light) (fallback)
```

### 2. Component Structure
- **ThemeProvider**: Single context provider, wraps root layout
- **useTheme hook**: Exposes `{theme, setTheme, resolvedTheme}` to consumers
- **ThemeToggle**: Presentational component, uses useTheme hook
- **theme-utils.ts**: Pure functions for theme resolution logic

### 3. Type Safety
```typescript
type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}
```

### 4. Testing Strategy
- **Unit Tests**: Theme utility functions, storage wrapper
- **Integration Tests**: ThemeContext provider, useTheme hook
- **Component Tests**: ThemeToggle rendering, keyboard interaction
- **E2E Tests** (future): Theme persistence across page navigation

---

## Security & Privacy Considerations

1. **localStorage Security**: Theme preference is not sensitive data, safe to store in localStorage
2. **XSS Prevention**: Theme values are validated against type union, no arbitrary strings accepted
3. **CSP Compatibility**: Inline blocking script requires `script-src 'unsafe-inline'` (or nonce) in CSP
4. **Privacy**: No theme preference tracking or analytics (out of scope)

---

## Open Questions Resolved

All technical questions from the planning phase have been answered:

✅ **State management pattern**: React Context API  
✅ **FOUC prevention**: Blocking script in layout  
✅ **Tailwind configuration**: `class` mode with CSS variables  
✅ **OS preference detection**: `matchMedia` API  
✅ **Accessibility compliance**: ARIA attributes + keyboard support  
✅ **localStorage fallback**: Try-catch with memory-only fallback  
✅ **Performance optimization**: CSS color transitions with reduced-motion support  

**No remaining unknowns** - Ready to proceed to Phase 1 (Design).
