'use client';

import { useSession } from 'next-auth/react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { About } from '@/components/landing/About';
import { Footer } from '@/components/landing/Footer';
import { Navbar } from '@/components/ui/Navbar';
import { Shell, Gradients } from '@/components/ui/Layout';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-neutral-tan">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // If authenticated, show the dashboard
  if (session) {
    return (
      <Shell>
        <Dashboard />
      </Shell>
    );
  }

  // If not authenticated, show the landing page
  return (
    <Shell>
      <Gradients />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <About />
      </main>
      <Footer />
    </Shell>
  );
}
