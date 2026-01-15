import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkStatus } from '@/components/NetworkStatus';
import { SessionProvider } from '@/components/SessionProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'Authenticated task management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('theme');
                let theme = 'light';
                
                if (stored) {
                  try {
                    const parsed = JSON.parse(stored);
                    const themeValue = parsed.theme || stored;
                    
                    if (themeValue === 'system') {
                      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    } else if (themeValue === 'dark' || themeValue === 'light') {
                      theme = themeValue;
                    }
                  } catch {
                    // If parsing fails, treat stored value as theme string directly
                    if (stored === 'dark' || stored === 'light') {
                      theme = stored;
                    } else if (stored === 'system') {
                      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                  }
                } else {
                  // No stored preference, use system preference
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
              } catch (e) {
                // Fallback to light theme on error
                document.documentElement.classList.add('light');
              }
            `,
          }}
        />
      </head>
      <body className="bg-background text-text min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <SessionProvider>
            <ErrorBoundary>
              <NetworkStatus />
              {children}
            </ErrorBoundary>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
