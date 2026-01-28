'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Shell, Gradients } from '@/components/ui/Layout';
import { Dashboard as DashboardComponent } from '@/components/Dashboard';
import { ChatProvider } from '@/contexts/ChatContext';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isTokenReady, setIsTokenReady] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Ensure auth token is available in localStorage for API calls
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // Token not in localStorage, need to re-login to get it
        console.warn('Auth token not found in localStorage. Please sign in again.');
        // Don't redirect, just show warning in chat interface
      }
      setIsTokenReady(true);
    }
  }, [status, session]);

  if (status === 'loading' || !isTokenReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-neutral-tan">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Shell>
      <Gradients />
      <Navbar />
      <ChatProvider>
        <DashboardComponent />
      </ChatProvider>
      <Footer />
    </Shell>
  );
}
