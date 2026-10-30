import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full border transition-colors";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    default: "bg-gray-100 text-text border-gray-200",
    primary: "bg-primary-subtle text-primary border-primary/20",
    success: "bg-accent-greenSubtle text-accent-green border-emerald-200",
    warning: "bg-accent-amberSubtle text-accent-amber border-amber-200",
    danger: "bg-accent-roseSubtle text-accent-rose border-rose-200",
    neutral: "bg-white text-text-muted border-border",
  };

  return (
    <span className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
};
