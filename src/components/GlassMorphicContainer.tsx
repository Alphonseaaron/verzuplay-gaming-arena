
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassMorphicContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'dark' | 'light';
  hoverEffect?: boolean;
  glowEffect?: boolean;
  children: React.ReactNode;
}

const GlassMorphicContainer = ({
  variant = 'dark',
  hoverEffect = false,
  glowEffect = false,
  className,
  children,
  ...props
}: GlassMorphicContainerProps) => {
  return (
    <div
      className={cn(
        variant === 'dark' ? 'glass' : 'glass-light',
        hoverEffect && 'transition-all duration-300 hover:shadow-glass-hover hover:-translate-y-1',
        glowEffect && 'before:content-[""] before:absolute before:inset-0 before:bg-glow-gradient before:rounded-inherit before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
        'relative rounded-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassMorphicContainer;
