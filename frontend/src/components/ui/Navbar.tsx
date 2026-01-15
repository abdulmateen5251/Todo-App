'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, Github } from 'lucide-react';
import { Button } from './Button';
import { ThemeToggle } from '../theme/ThemeToggle';

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Todo App Home"
          >
            <div className="p-1.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-text tracking-tight">
              <span className="text-primary">Todo</span> App
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
              onClick={(e) => {
                const currentPath = window.location.pathname;
                if (currentPath === '/') {
                  e.preventDefault();
                  const heroElement = document.getElementById('hero');
                  if (heroElement) {
                    heroElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
            >
              About
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {session ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/50"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-text hover:text-primary transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-surface border-b border-border px-4 pt-2 pb-6 flex flex-col gap-4"
          >
            <Link
              href="/"
              onClick={(e) => {
                const currentPath = window.location.pathname;
                setIsOpen(false);
                if (currentPath === '/') {
                  e.preventDefault();
                  setTimeout(() => {
                    const heroElement = document.getElementById('hero');
                    if (heroElement) {
                      heroElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }
              }}
              className="text-lg font-medium text-text py-2 hover:text-primary border-b border-border"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-text py-2 hover:text-primary border-b border-border"
            >
              About
            </Link>
            {session && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-text py-2 hover:text-primary border-b border-border"
              >
                Dashboard
              </Link>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-text py-2 hover:text-primary border-b border-border flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
            
            <div className="flex flex-col gap-3 pt-2">
              {session ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button 
                      variant="default" 
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/50"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
