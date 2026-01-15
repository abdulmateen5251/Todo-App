'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Shell, Gradients } from '@/components/ui/Layout';
import { Dashboard as DashboardComponent } from '@/components/Dashboard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
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
      <DashboardComponent />
      <Footer />
    </Shell>
  );
}
