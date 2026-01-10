import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkStatus } from '@/components/NetworkStatus';
import { SessionProvider } from '@/components/SessionProvider';

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
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <SessionProvider>
          <ErrorBoundary>
            <NetworkStatus />
            {children}
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}
