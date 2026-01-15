# Theme System - Quick Reference

## For Developers

### Using the Theme Hook

```tsx
import { useTheme } from '@/components/ThemeProvider';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  // Check current theme
  const isDark = theme === 'dark';
  
  // Toggle between themes
  const handleToggle = () => toggleTheme();
  
  // Set specific theme
  const goLight = () => setTheme('light');
  const goDark = () => setTheme('dark');
  
  return <div>Current theme: {theme}</div>;
}
```

### Color Classes Reference

#### Backgrounds
```tsx
className="bg-background"           // Main app background
className="bg-background-secondary" // Secondary surfaces
className="bg-surface"              // Cards, panels, containers
className="bg-primary"              // Primary buttons
className="bg-secondary"            // Secondary accents
```

#### Text Colors
```tsx
className="text-text"       // Primary body text (ALWAYS use for readable text)
className="text-text-muted" // Secondary/muted text (labels, captions)
className="text-primary"    // Icons, headings, hover states ONLY
className="text-secondary"  // Highlights and accents ONLY
```

#### Borders
```tsx
className="border-border"   // Standard borders
className="border-primary"  // Primary accent borders
className="border-secondary" // Secondary accent borders
```

### ✅ DO's

```tsx
// ✅ Use semantic color tokens
<div className="bg-background text-text" />

// ✅ Use primary/secondary for buttons
<button className="bg-primary hover:bg-primary-dark text-white" />

// ✅ Use primary/secondary for icons
<Icon className="text-primary" />

// ✅ Use primary/secondary for headings
<h1 className="text-4xl font-bold text-primary" />

// ✅ Use for hover states
<a className="text-text-muted hover:text-primary" />
```

### ❌ DON'Ts

```tsx
// ❌ Never use hardcoded hex colors
<div className="bg-[#0B0F1A] text-[#E5E7EB]" />

// ❌ Never use primary/secondary for body text
<p className="text-primary">Long paragraph text...</p>

// ❌ Don't use inline styles for colors
<div style={{ backgroundColor: '#0B0F1A' }} />

// ❌ Don't mix theme variables with hardcoded colors
<div className="bg-background border-[#E5E7EB]" />
```

### Common Patterns

#### Card Component
```tsx
<div className="bg-surface border border-border rounded-lg p-6">
  <h3 className="text-xl font-bold text-text mb-2">Title</h3>
  <p className="text-text-muted">Description text</p>
</div>
```

#### Button Variants
```tsx
// Primary button
<button className="bg-primary hover:bg-primary-dark text-white">
  Click me
</button>

// Ghost button
<button className="text-text-muted hover:text-primary hover:bg-surface">
  Click me
</button>

// Outline button
<button className="border-2 border-primary text-primary hover:bg-primary/10">
  Click me
</button>
```

#### Interactive Elements
```tsx
<div className="group">
  <Icon className="text-secondary group-hover:text-primary transition-colors" />
  <span className="text-text group-hover:text-primary transition-colors">
    Hover me
  </span>
</div>
```

### Theme-Specific Logic

```tsx
import { useTheme } from '@/components/ThemeProvider';

function MyComponent() {
  const { theme } = useTheme();
  
  // Conditional rendering based on theme
  return (
    <div>
      {theme === 'dark' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </div>
  );
}
```

### Testing Theme Changes

1. Open the app in browser
2. Click the theme toggle in navbar (Sun/Moon icon)
3. Verify:
   - Theme changes instantly
   - No layout shifts
   - All colors update smoothly
   - Reload page - theme persists

### Debugging

```tsx
// Log current theme
const { theme } = useTheme();
console.log('Current theme:', theme);

// Check localStorage
console.log('Stored theme:', localStorage.getItem('theme'));

// Check document class
console.log('Dark mode active:', document.documentElement.classList.contains('dark'));
```

## Color Values (for reference only - use classes in code)

### Dark Theme
- Background: `#0B0F1A`
- Surface: `#1E293B`
- Primary: `#4F46E5`
- Secondary: `#22D3EE`
- Text: `#E5E7EB`
- Text Muted: `#9CA3AF`

### Light Theme
- Background: `#FFFFFF`
- Surface: `#F1F5F9`
- Primary: `#4F46E5`
- Secondary: `#22D3EE`
- Text: `#0F172A`
- Text Muted: `#475569`

## Need Help?

- **Documentation**: See [THEME_SYSTEM.md](./THEME_SYSTEM.md) for full details
- **Contrast Test**: Run `npx ts-node frontend/tests/contrast-test.ts`
- **Example Usage**: Check `src/components/ui/Navbar.tsx` for reference
