'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * Client-side session provider wrapper
 * Wraps NextAuth's SessionProvider for use in the app
 */
export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
