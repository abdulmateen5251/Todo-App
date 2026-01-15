# Quickstart Guide: Dark & Light Theme System

**Feature**: 001-theme-system  
**Audience**: Developers implementing or using the theme system  
**Last Updated**: January 14, 2026

## 🚀 Quick Start (5 minutes)

### For Users

**Toggle Theme:**
1. Look for sun/moon icon in the navigation bar
2. Click to switch between light and dark modes
3. Your preference is automatically saved

**That's it!** The app remembers your choice across visits.

---

### For Developers

**Use theme in a component:**

```tsx
import { useTheme } from '@/hooks/useTheme';

export function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Go Dark
      </button>
    </div>
  );
}
```

**Add theme-aware styles:**

```tsx
<div className="bg-background text-text">
  <h1 className="text-primary dark:text-primary-light">
    Hello World
  </h1>
</div>
```

**Done!** The theme system handles everything else automatically.

---

## 📚 Core Concepts

### 1. Theme vs Resolved Theme

- **`theme`** - User's selection: `'light'`, `'dark'`, or `'system'`
- **`resolvedTheme`** - Actual theme displayed: `'light'` or `'dark'`

```tsx
const { theme, resolvedTheme } = useTheme();

// User selected auto-detect
theme === 'system'          // true
resolvedTheme === 'dark'    // true (because OS is in dark mode)
```

### 2. Theme Precedence

Themes are resolved in this order:
1. **Manual selection** (user clicked toggle)
2. **localStorage** (saved preference)
3. **OS preference** (auto-detected)
4. **Default** (light mode)

### 3. Automatic Features

✅ **Persistence** - Saved to localStorage automatically  
✅ **SSR Safe** - No hydration mismatches  
✅ **FOUC Prevention** - No flash of wrong theme  
✅ **Accessibility** - Keyboard + screen reader support  
✅ **Performance** - <100ms theme switching  

---

## 🛠️ Implementation Guide

### Step 1: Wrap App with Provider

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Important:** `suppressHydrationWarning` prevents console warnings from the FOUC prevention script.

### Step 2: Add Toggle Button

```tsx
// app/components/Header.tsx
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  return (
    <nav>
      <ThemeToggle className="ml-auto" />
    </nav>
  );
}
```

### Step 3: Use Theme in Components

```tsx
import { useTheme } from '@/hooks/useTheme';

export function StatusBadge() {
  const { resolvedTheme } = useTheme();
  
  return (
    <span className={`
      px-2 py-1 rounded
      ${resolvedTheme === 'dark' 
        ? 'bg-gray-800 text-gray-200' 
        : 'bg-gray-200 text-gray-800'}
    `}>
      Status
    </span>
  );
}
```

**Better approach:** Use Tailwind dark mode classes:

```tsx
<span className="
  px-2 py-1 rounded
  bg-surface text-text
  dark:bg-surface-dark dark:text-text-dark
">
  Status
</span>
```

---

## 🎨 Styling Guide

### Using CSS Variables

All theme colors are available as CSS custom properties:

```css
/* Light mode default */
background-color: var(--color-background); /* #FFFFFF */
color: var(--color-text);                  /* #111827 */

/* Automatically switches in dark mode */
.dark {
  /* --color-background is now #0B0F1A */
  /* --color-text is now #E5E7EB */
}
```

### Using Tailwind Classes

Recommended approach for most cases:

```tsx
<div className="bg-background text-text">
  <h1 className="text-primary">Title</h1>
  <p className="text-text-muted">Description</p>
  <div className="bg-surface border border-border">
    Card content
  </div>
</div>
```

### Dark Mode Variants

For conditional styling:

```tsx
<button className="
  bg-primary text-white
  hover:bg-primary-dark
  dark:bg-primary-light
  dark:hover:bg-primary
">
  Click me
</button>
```

---

## 📖 API Reference

### `useTheme()` Hook

```typescript
interface UseThemeReturn {
  theme: Theme;                    // 'light' | 'dark' | 'system'
  resolvedTheme: ResolvedTheme;    // 'light' | 'dark'
  setTheme: (theme: Theme) => void;
}
```

**Example:**
```tsx
const { theme, resolvedTheme, setTheme } = useTheme();

// Get current theme
console.log(theme);           // 'system'
console.log(resolvedTheme);   // 'dark'

// Change theme
setTheme('light');   // Force light mode
setTheme('dark');    // Force dark mode
setTheme('system');  // Auto-detect from OS
```

### `ThemeProvider` Component

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;      // Default: 'light'
  storageKey?: string;       // Default: 'theme'
}
```

**Example:**
```tsx
<ThemeProvider defaultTheme="system" storageKey="app-theme">
  <App />
</ThemeProvider>
```

### `ThemeToggle` Component

```typescript
interface ThemeToggleProps {
  className?: string;
  iconSize?: number;         // Default: 24
  showLabel?: boolean;       // Default: false
}
```

**Example:**
```tsx
<ThemeToggle 
  className="fixed top-4 right-4"
  iconSize={20}
  showLabel={true}
/>
```

---

## 🎯 Common Patterns

### 1. Conditional Rendering Based on Theme

```tsx
const { resolvedTheme } = useTheme();

return (
  <div>
    {resolvedTheme === 'dark' ? (
      <DarkModeChart />
    ) : (
      <LightModeChart />
    )}
  </div>
);
```

### 2. Theme-Aware Images

```tsx
const { resolvedTheme } = useTheme();

return (
  <img 
    src={resolvedTheme === 'dark' 
      ? '/logo-white.svg' 
      : '/logo-black.svg'
    }
    alt="Logo"
  />
);
```

### 3. Programmatic Theme Changes

```tsx
function SettingsPage() {
  const { setTheme } = useTheme();
  
  const handleSave = () => {
    const userPref = getUserThemePreference();
    setTheme(userPref);
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

### 4. Custom Toggle Component

```tsx
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

export function CustomToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  
  const toggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      className="p-2 rounded hover:bg-surface"
    >
      {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
```

---

## ♿ Accessibility Guide

The theme system is built with accessibility as a core requirement. All components follow WCAG 2.1 Level AA guidelines.

### Keyboard Navigation

**ThemeToggle Component:**
- ✅ **Tab Navigation**: Toggle button is reachable via Tab key
- ✅ **Activation**: Press Enter or Space to toggle theme
- ✅ **Focus Indicator**: Visible focus ring (blue outline) when focused
- ✅ **No Keyboard Traps**: Focus moves naturally through the page

**Testing Keyboard Access:**
```bash
1. Press Tab until theme toggle is focused (blue ring appears)
2. Press Enter or Space - theme should change
3. Continue tabbing - focus moves to next element
```

### Screen Reader Support

**ARIA Attributes:**
```tsx
<button
  role="switch"                    // Semantic role for toggle switches
  aria-label="Switch to dark mode" // Descriptive action label
  aria-checked="false"             // Current state (false = light, true = dark)
  aria-pressed="false"             // Alternate state indicator
>
  <Sun /> {/* Icon */}
</button>
```

**Screen Reader Announcements:**
- **VoiceOver (macOS)**: "Switch to dark mode, switch button, off"
- **NVDA (Windows)**: "Switch to dark mode, toggle button, not pressed"
- **JAWS (Windows)**: "Switch to dark mode, switch, off"

**Testing with Screen Readers:**
- macOS: Enable VoiceOver (Cmd+F5)
- Windows: Install [NVDA](https://www.nvaccess.org/) (free)
- Navigate to toggle and verify announcement includes action and state

### Reduced Motion Support

**Respects User Preferences:**
The theme system automatically disables animations for users who prefer reduced motion:

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Testing Reduced Motion:**
- **macOS**: System Preferences → Accessibility → Display → Reduce Motion
- **Windows**: Settings → Ease of Access → Display → Show animations
- **Browser DevTools**: Chrome/Edge → Rendering → Emulate CSS media → prefers-reduced-motion: reduce

### Color Contrast Compliance

**WCAG AA Standards:**
All color combinations meet minimum contrast ratios:

| Element Type | Light Mode | Dark Mode | Ratio | Status |
|-------------|------------|-----------|-------|--------|
| Body Text | #111827 on #FFFFFF | #E5E7EB on #0B0F1A | ≥4.5:1 | ✅ Pass |
| Headings | #0F172A on #FFFFFF | #F9FAFB on #0B0F1A | ≥4.5:1 | ✅ Pass |
| Primary CTA | #FFFFFF on #3B82F6 | #FFFFFF on #60A5FA | ≥4.5:1 | ✅ Pass |
| Borders | #E5E7EB on #FFFFFF | #374151 on #1F2937 | ≥3:1 | ✅ Pass |

**Testing Contrast:**
```bash
# Use browser DevTools
1. Open Chrome DevTools (F12)
2. Select element
3. Check "Contrast" in accessibility panel
4. Verify ratio meets WCAG AA (≥4.5:1 for text)
```

### Focus Management

**Visible Focus Indicators:**
```tsx
// All interactive elements have visible focus styles
className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-primary 
  focus:ring-offset-2
  focus:ring-offset-background
"
```

**Focus Order:**
- Natural tab order follows visual layout
- No `tabindex` > 0 (avoid disrupting natural flow)
- Hidden elements excluded from focus order

### Semantic HTML

**Proper Element Usage:**
```tsx
// ✅ Correct - button for interactive actions
<button onClick={toggleTheme}>Toggle Theme</button>

// ❌ Wrong - div is not interactive
<div onClick={toggleTheme}>Toggle Theme</div>
```

### Accessibility Testing Checklist

Before deploying theme changes, verify:

- [ ] **Keyboard**: Toggle reachable and activatable via keyboard
- [ ] **Screen Reader**: Button announces action and state clearly
- [ ] **Focus Visible**: Blue focus ring appears when tabbing
- [ ] **Color Contrast**: All text meets WCAG AA ratios (use DevTools)
- [ ] **Reduced Motion**: Transitions disabled when preference set
- [ ] **Semantic HTML**: Interactive elements use `<button>` not `<div>`
- [ ] **ARIA**: `role="switch"` and `aria-checked` present
- [ ] **No JS**: Theme persists even if JavaScript fails (via FOUC script)

### Resources

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## 🐛 Troubleshooting

### Problem: Theme flashes wrong color on page load

**Solution:** Ensure `suppressHydrationWarning` is on `<html>` tag:

```tsx
<html suppressHydrationWarning>
```

### Problem: Dark mode styles not applying

**Check:**
1. ✅ Tailwind config has `darkMode: 'class'`
2. ✅ `ThemeProvider` wraps your app
3. ✅ Using correct class names (e.g., `bg-background` not `bg-white`)

### Problem: Theme not persisting across sessions

**Check:**
1. ✅ localStorage is enabled (not private browsing)
2. ✅ No console errors about localStorage access
3. ✅ Verify with: `localStorage.getItem('theme')`

### Problem: Hook error "useTheme must be used within ThemeProvider"

**Solution:** Ensure component is inside `<ThemeProvider>`:

```tsx
// ❌ Wrong
<App>
  <MyComponent />  {/* Can't use useTheme here */}
</App>

// ✅ Correct
<ThemeProvider>
  <App>
    <MyComponent />  {/* useTheme works here */}
  </App>
</ThemeProvider>
```

---

## ⚡ Performance Tips

### 1. Avoid Theme-Dependent useEffect

```tsx
// ❌ Bad - runs on every theme change
useEffect(() => {
  fetchData();
}, [resolvedTheme]);

// ✅ Good - only run on mount
useEffect(() => {
  fetchData();
}, []);
```

### 2. Use CSS Variables Over JS

```tsx
// ❌ Slower - requires re-render
const bgColor = resolvedTheme === 'dark' ? '#0B0F1A' : '#FFFFFF';
<div style={{ backgroundColor: bgColor }} />

// ✅ Faster - pure CSS
<div className="bg-background" />
```

### 3. Prefer Tailwind Dark Classes

```tsx
// ❌ Conditional className (re-renders)
<div className={resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} />

// ✅ Static className (no re-render needed)
<div className="bg-background dark:bg-background-dark" />
```

---

## 🧪 Testing

### Testing Theme Changes

```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { useTheme } from '@/hooks/useTheme';

function TestComponent() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>Toggle</button>
    </div>
  );
}

test('theme changes when button clicked', () => {
  render(
    <ThemeProvider defaultTheme="light">
      <TestComponent />
    </ThemeProvider>
  );
  
  expect(screen.getByTestId('theme')).toHaveTextContent('light');
  
  screen.getByRole('button').click();
  
  expect(screen.getByTestId('theme')).toHaveTextContent('dark');
});
```

---

## 📦 File Structure

```
frontend/src/
├── contexts/
│   └── ThemeContext.tsx       # Context definition
├── hooks/
│   └── useTheme.ts            # Hook for consuming theme
├── components/
│   └── theme/
│       ├── ThemeProvider.tsx  # Provider component
│       └── ThemeToggle.tsx    # Toggle button
├── lib/
│   └── theme-utils.ts         # Helper functions
└── types/
    └── theme.ts               # TypeScript interfaces
```

---

## 🔗 Related Documentation

- [Full Specification](./spec.md) - Complete feature requirements
- [Data Model](./data-model.md) - State management details
- [Research](./research.md) - Technology decisions and best practices
- [Type Contracts](./contracts/theme.types.ts) - TypeScript definitions

---

## 💡 Best Practices Summary

✅ **DO:**
- Use Tailwind dark mode classes for styling
- Leverage CSS variables for theme colors
- Test theme changes in both light and dark modes
- Provide accessible labels for theme toggles
- Handle localStorage gracefully (may be unavailable)

❌ **DON'T:**
- Hardcode colors (`#FFFFFF`) - use theme tokens
- Rely on JavaScript for theme-dependent styling
- Forget to test keyboard navigation
- Assume localStorage is always available
- Create multiple theme contexts

---

## 🎓 Learning Resources

### New to Dark Mode?
- Start with Tailwind's [Dark Mode Guide](https://tailwindcss.com/docs/dark-mode)
- Read about [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

### Need Help?
- Check [Troubleshooting](#-troubleshooting) section
- Review [research.md](./research.md) for implementation details
- See [data-model.md](./data-model.md) for state management

---

**Ready to implement?** Start with Step 1 above and work through the implementation guide. The entire setup takes about 30 minutes for a new developer.
