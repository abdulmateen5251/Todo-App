import * as React from 'react';
import { cn } from './utils/cn';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  container?: boolean;
}

export function Section({ children, className, container = true, ...props }: SectionProps) {
  return (
    <section
      className={cn('py-20 px-4 md:py-32 overflow-hidden', className)}
      {...props}
    >
      {container ? (
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      ) : children}
    </section>
  );
}

export function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-screen bg-background text-text selection:bg-primary selection:text-background', className)}>
      {children}
    </div>
  );
}

export function Gradients() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-primary-light/5 blur-[100px] rounded-full" />
    </div>
  );
}
