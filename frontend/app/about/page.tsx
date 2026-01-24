'use client';

import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Shell, Gradients } from '@/components/ui/Layout';
import { motion } from 'framer-motion';
import { Sparkles, Target, Zap, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <Shell>
      <Gradients />
      <Navbar />
      
      <main className="pt-32 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-primary">About Us</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">
              Redefining the Todo List
            </h1>
            
            <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto">
              We believe productivity isn&apos;t just about doing more—it&apos;s about doing what matters.
            </p>
          </motion.div>

          {/* Vision Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16 p-8 rounded-2xl bg-surface border border-border"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-4">Our Vision</h2>
            <p className="text-base md:text-lg text-text-muted leading-relaxed mb-4">
              Our vision is to create a seamless interface between human intention and machine intelligence,
              letting you focus on your creative work while our AI handles the organization.
              Augmented Productivity is the future.
            </p>
            <p className="text-base md:text-lg text-text-muted leading-relaxed">
              This Todo App project represents a modern approach to task management, combining a robust 
              Next.js frontend with a powerful FastAPI backend. Designed for developers and power users, 
              it features real-time updates, intelligent categorization, and a sleek, responsive UI 
              crafted for efficiency and focus.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mb-16"
          >
            <div className="p-6 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Focused</h3>
              <p className="text-sm text-text-muted">
                Minimalist design that keeps you focused on what truly matters.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Fast</h3>
              <p className="text-sm text-text-muted">
                Lightning-fast performance with real-time updates and smooth animations.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">User-Centric</h3>
              <p className="text-sm text-text-muted">
                Built with developers in mind, designed for everyone.
              </p>
            </div>
          </motion.div>

          {/* Technology Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-8 rounded-2xl bg-surface border border-border"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-6 text-center">Built With Modern Tech</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">Frontend</h3>
                <ul className="space-y-2 text-text-muted">
                  <li>• Next.js 14 with App Router</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Framer Motion for animations</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">Backend</h3>
                <ul className="space-y-2 text-text-muted">
                  <li>• FastAPI for high performance</li>
                  <li>• PostgreSQL database</li>
                  <li>• JWT authentication</li>
                  <li>• RESTful API design</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </Shell>
  );
}
