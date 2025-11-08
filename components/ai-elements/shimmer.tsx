'use client';

import React, { ElementType, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ShimmerProps {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

export const Shimmer = memo(function Shimmer({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}: ShimmerProps) {
  const calculatedSpread = useMemo(
    () => children.length * spread,
    [children, spread],
  );

  const ComponentWithChildren = Component as React.ComponentType<{ className?: string; style?: React.CSSProperties; children?: React.ReactNode }>;
  
  return (
    <ComponentWithChildren
      className={cn(
        'relative inline-block bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent',
        className,
      )}
      style={{
        backgroundSize: `${calculatedSpread}% 100%`,
      }}
    >
      <motion.span
        className="inline-block"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%'],
        }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
        }}
        style={{
          backgroundImage:
            'linear-gradient(90deg, var(--foreground) 0%, var(--muted-foreground) 50%, var(--foreground) 100%)',
          backgroundSize: `${calculatedSpread}% 100%`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {children}
      </motion.span>
    </ComponentWithChildren>
  );
});

