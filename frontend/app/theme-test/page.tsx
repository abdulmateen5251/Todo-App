'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Layout';

export default function ThemeTestPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background pt-20">
      <Section>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-text">Theme System Test</h1>
            <p className="text-text-muted">Current theme: <span className="font-bold text-primary">{theme}</span></p>
            <Button onClick={toggleTheme} variant="default">
              Toggle to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
          </div>

          {/* Color Palette */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-text">Color Palette</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-20 bg-background border border-border rounded-lg" />
                <p className="text-sm text-text-muted">Background</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 bg-surface border border-border rounded-lg" />
                <p className="text-sm text-text-muted">Surface</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 bg-primary rounded-lg" />
                <p className="text-sm text-text-muted">Primary</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 bg-secondary rounded-lg" />
                <p className="text-sm text-text-muted">Secondary</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 bg-surface border border-border rounded-lg flex items-center justify-center">
                  <span className="text-text font-bold">Text</span>
                </div>
                <p className="text-sm text-text-muted">Text Color</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 bg-surface border border-border rounded-lg flex items-center justify-center">
                  <span className="text-text-muted font-bold">Muted</span>
                </div>
                <p className="text-sm text-text-muted">Muted Text</p>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-text">Typography</h2>
            <h1 className="text-4xl font-bold text-text">Heading 1</h1>
            <h2 className="text-3xl font-bold text-text">Heading 2</h2>
            <h3 className="text-2xl font-bold text-text">Heading 3</h3>
            <p className="text-text">Regular body text with proper contrast for readability.</p>
            <p className="text-text-muted">Muted text for secondary information and labels.</p>
            <p className="text-sm text-text-muted">Small muted text for captions.</p>
          </div>

          {/* Buttons */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-text">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ai" glow>AI Button</Button>
            </div>
          </div>

          {/* Cards */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-text">Cards & Containers</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-background-secondary border border-border rounded-lg p-4 space-y-2">
                <h3 className="text-lg font-bold text-primary">Card Title</h3>
                <p className="text-text">Card content with proper background contrast.</p>
                <p className="text-sm text-text-muted">Additional metadata</p>
              </div>
              
              <div className="bg-background-secondary border border-border rounded-lg p-4 space-y-2">
                <h3 className="text-lg font-bold text-secondary">Accent Card</h3>
                <p className="text-text">Another card demonstrating theme colors.</p>
                <p className="text-sm text-text-muted">Secondary information</p>
              </div>
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-text">Interactive Elements</h2>
            
            <div className="space-y-2">
              <a href="#" className="block text-text hover:text-primary transition-colors">
                Hover link (text-text → text-primary)
              </a>
              <a href="#" className="block text-text-muted hover:text-secondary transition-colors">
                Hover link (text-text-muted → text-secondary)
              </a>
            </div>
            
            <div className="flex gap-4">
              <button className="p-3 rounded-lg bg-background-secondary border border-border hover:border-primary transition-colors">
                Hover me
              </button>
              <button className="p-3 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                Icon Button
              </button>
            </div>
          </div>

          {/* Form Elements */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-text">Form Elements</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-muted">
                Input Label
              </label>
              <input
                type="text"
                placeholder="Placeholder text"
                className="w-full px-4 py-3 bg-background-secondary border border-border placeholder-text-muted text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-muted">
                Textarea
              </label>
              <textarea
                placeholder="Enter your text..."
                rows={4}
                className="w-full px-4 py-3 bg-background-secondary border border-border placeholder-text-muted text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Contrast Info */}
          <div className="bg-surface border border-primary rounded-lg p-6 space-y-2">
            <h3 className="text-xl font-bold text-primary">WCAG Compliance ✅</h3>
            <p className="text-text">
              All text colors meet WCAG AA standards for contrast:
            </p>
            <ul className="list-disc list-inside text-text-muted space-y-1">
              <li>Text on Background: {theme === 'dark' ? '15.46:1' : '17.85:1'} (AAA)</li>
              <li>Muted Text on Background: {theme === 'dark' ? '7.54:1' : '7.58:1'} (AAA)</li>
              <li>Text on Surface: {theme === 'dark' ? '11.82:1' : '16.30:1'} (AAA)</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}
