import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkStatus } from '@/components/NetworkStatus';

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
        <ErrorBoundary>
          <NetworkStatus />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
