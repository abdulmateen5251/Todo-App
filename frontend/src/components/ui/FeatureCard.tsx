'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from './utils/cn';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  index?: number;
}

export function FeatureCard({ title, description, icon, className, index = 0 }: FeatureCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'relative h-[250px] w-full rounded-xl bg-surface p-8 border border-border overflow-hidden group cursor-pointer',
        'hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50 transition-all',
        className
      )}
    >
      <div
        style={{ transform: 'translateZ(50px)' }}
        className="relative z-10 flex flex-col h-full"
      >
        <div className="mb-4 text-secondary group-hover:text-primary group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-text-muted text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Decorative gradient background glow */}
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-secondary/10 blur-[60px] group-hover:bg-secondary/20 transition-colors" />
    </motion.div>
  );
}

export function FeaturesGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
}
