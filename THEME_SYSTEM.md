# Theme System Documentation

## Overview
This project implements a fully functional dark/light theme system with the following features:
- Theme persistence via localStorage
- System preference detection as fallback
- Smooth transitions between themes
- WCAG compliant contrast ratios
- No flash of unstyled content (FOUC)

## Color System

### Dark Theme (Default)
- **Background**: `#0B0F1A` (Deep Navy)
- **Background Secondary**: `#12182A` (Darker Slate)
- **Surface/Cards**: `#1E293B` (Dark Slate)
- **Primary**: `#4F46E5` (Indigo)
- **Primary Dark**: `#4338CA` (Darker Indigo for hovers)
- **Primary Light**: `#6366F1` (Lighter Indigo)
- **Secondary**: `#22D3EE` (Cyan - accents/highlights)
- **Secondary Dark**: `#06B6D4` (Darker Cyan)
- **Text**: `#E5E7EB` (Soft White)
- **Text Muted**: `#9CA3AF` (Gray)
- **Border**: `#1E293B` (Dark Slate)

### Light Theme
- **Background**: `#FFFFFF` (White)
- **Background Secondary**: `#F8FAFC` (Very Light Slate)
- **Surface/Cards**: `#F1F5F9` (Light Slate)
- **Primary**: `#4F46E5` (Indigo - same as dark)
- **Primary Dark**: `#4338CA` (Darker Indigo for hovers)
- **Primary Light**: `#6366F1` (Lighter Indigo)
- **Secondary**: `#22D3EE` (Cyan - same as dark)
- **Secondary Dark**: `#06B6D4` (Darker Cyan)
- **Text**: `#0F172A` (Near Black)
- **Text Muted**: `#475569` (Slate Gray)
- **Border**: `#E2E8F0` (Light Border)

## Implementation

### 1. Configuration Files

**tailwind.config.js**
- Enabled `darkMode: 'class'` strategy
- Extended color palette with semantic tokens

**globals.css**
- CSS custom properties for both themes
- Smooth transitions on all color properties
- Theme-specific variables under `:root` and `.dark`

### 2. Theme Management

**ThemeProvider** (`src/components/ThemeProvider.tsx`)
- React Context for global theme state
- localStorage persistence
- System preference detection
- Prevents hydration mismatch

**ThemeToggle** (`src/components/ui/ThemeToggle.tsx`)
- Accessible toggle button with ARIA labels
- Animated sun/moon icons
- Smooth transitions

### 3. Layout Integration

**layout.tsx**
- Inline script prevents FOUC
- `suppressHydrationWarning` on `<html>`
- ThemeProvider wraps entire app

### 4. Component Usage

All components use Tailwind's semantic color classes:
```tsx
// Correct (theme-aware)
<div className="bg-background text-text" />
<button className="bg-primary hover:bg-primary-dark" />

// Incorrect (hardcoded)
<div className="bg-[#0B0F1A] text-[#E5E7EB]" />
```

## Usage

### Toggle Theme Programmatically
```tsx
import { useTheme } from '@/components/ThemeProvider';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

### Check Current Theme
```tsx
const { theme } = useTheme();
const isDark = theme === 'dark';
```

## Accessibility

### WCAG Compliance

All text color combinations meet WCAG AA standards:

**Dark Theme:**
- ✅ Text on Background: 15.46:1 (AAA)
- ✅ Muted Text on Background: 7.54:1 (AAA)
- ✅ Text on Surface: 11.82:1 (AAA)

**Light Theme:**
- ✅ Text on Background: 17.85:1 (AAA)
- ✅ Muted Text on Background: 7.58:1 (AAA)
- ✅ Text on Surface: 16.30:1 (AAA)

### Color Usage Guidelines

**Primary (#4F46E5) and Secondary (#22D3EE)** should ONLY be used for:
- ✅ Buttons with solid backgrounds
- ✅ Icons and decorative elements
- ✅ Large text (18pt+) and headings
- ✅ Hover states and focus indicators
- ✅ Borders and accents
- ❌ NOT for body text or small text

**Text Colors:**
- Use `text-text` for primary body text
- Use `text-text-muted` for secondary/muted text
- Use `text-primary` only for icons, headings, and hover states
- Use `text-secondary` only for highlights and accents

### Features

- ✅ WCAG AA compliant contrast ratios for all text
- ✅ Keyboard navigation supported
- ✅ ARIA labels on theme toggle
- ✅ Respects user's system preference
- ✅ Focus states clearly visible
- ✅ Smooth transitions (200ms) for reduced motion

## Testing Checklist

- [x] Theme persists across page reloads
- [x] Theme persists across browser sessions
- [x] System preference detection works
- [x] No flash of unstyled content
- [x] All components adapt to theme
- [x] Transitions are smooth
- [x] Contrast ratios meet WCAG AA
- [x] Keyboard navigation works
- [x] Mobile responsive theme toggle

## Files Modified/Created

### Created
- `src/components/ThemeProvider.tsx` - Theme context and provider
- `src/components/ui/ThemeToggle.tsx` - Theme toggle component

### Modified
- `tailwind.config.js` - Added dark mode support
- `app/globals.css` - Added theme CSS variables
- `app/layout.tsx` - Integrated ThemeProvider, added FOUC prevention
- `src/components/ui/Navbar.tsx` - Already had theme toggle integrated

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Performance

- Zero runtime overhead (CSS variables)
- No layout shifts during theme change
- Instant theme switching
- ~1KB bundle size increase
