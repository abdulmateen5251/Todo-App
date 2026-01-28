'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Shell, Gradients } from '@/components/ui/Layout';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, call backend directly to get token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const loginResponse = await fetch(`${apiUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      const loginData = await loginResponse.json();
      
      // Store token in localStorage for API calls
      if (loginData.access_token) {
        localStorage.setItem('auth_token', loginData.access_token);
      }

      // Then sign in with NextAuth for session management
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        localStorage.removeItem('auth_token'); // Clean up on error
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      localStorage.removeItem('auth_token'); // Clean up on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <Gradients />
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-surface backdrop-blur-lg p-8 rounded-2xl border border-border shadow-xl">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-text">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-text-muted">
              Or{' '}
              <Link href="/auth/signup" className="font-bold text-primary hover:text-secondary transition-colors">
                create a new account
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-text-muted bg-primary/10 p-2 rounded border border-primary/30">
              💡 Development Mode - Use any email/password
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-primary/10 p-4 border border-primary/30 animate-pulse">
                <div className="flex">
                  <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-primary font-bold">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-background-secondary border border-border placeholder-text-muted text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-background-secondary border border-border placeholder-text-muted text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </Shell>
  );
}
