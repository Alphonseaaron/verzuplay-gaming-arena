
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-r from-verzus-primary to-verzus-accent rounded-md flex items-center justify-center overflow-hidden shadow-accent-glow">
          <div className="absolute inset-0 bg-verzus-background-light opacity-50 mix-blend-overlay"></div>
          <span className="relative text-white font-extrabold">V</span>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-verzus-accent rounded-full shadow-accent-glow animate-pulse-soft"></div>
      </div>
      <span className={`font-bold ${sizeClasses[size]} bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent`}>
        Verzus<span className="text-gradient font-black">Play</span>
      </span>
    </Link>
  );
};

export default Logo;
