'use client';

import Link from 'next/link';
import { Github, Linkedin, Sparkles } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="p-1.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-text tracking-tight">
                <span className="text-primary">Todo</span> App
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed text-center md:text-left max-w-md">
              Intelligent task management powered by AI. Stay organized, boost productivity.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/abdulmateen5251"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-surface text-text-muted hover:bg-primary/20 hover:text-secondary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/abdul-mateen-048241275/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-surface text-text-muted hover:bg-primary/20 hover:text-secondary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-sm text-text-muted">
            © {currentYear} Todo App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
