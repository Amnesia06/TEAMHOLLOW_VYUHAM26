import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "neutral" | "subtle";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "neutral",
  size = "md",
  ...props
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  const variantStyles = {
    primary: "bg-primary-subtle text-primary border border-primary/20",
    success: "bg-accent-greenSubtle text-accent-green border border-accent-green/20",
    warning: "bg-accent-amberSubtle text-accent-amber border border-accent-amber/20",
    danger: "bg-accent-roseSubtle text-accent-rose border border-accent-rose/20",
    neutral: "bg-gray-100 text-text border border-border",
    subtle: "bg-gray-50 text-text-muted border border-border-light",
  };

  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full", sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};

