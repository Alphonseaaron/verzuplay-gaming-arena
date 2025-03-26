
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "btn-primary",
    accent: "btn-accent",
    outline: "btn-outline",
    ghost: "btn-ghost",
  };

  const sizeClasses = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2.5 px-5",
    lg: "py-3 px-6 text-lg",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
