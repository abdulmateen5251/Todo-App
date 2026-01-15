'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/50',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10',
        ghost: 'text-text-muted hover:text-text hover:bg-surface',
        ai: 'bg-primary text-white font-bold hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/50',
        secondary: 'bg-surface text-text hover:bg-primary hover:text-white',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
      glow: {
        true: 'after:absolute after:inset-0 after:z-[-1] after:bg-secondary after:blur-xl after:opacity-0 hover:after:opacity-40 after:transition-opacity',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      glow: false,
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, glow, ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(buttonVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {props.children}
        </span>
        {variant === 'ai' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform" />
        )}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
