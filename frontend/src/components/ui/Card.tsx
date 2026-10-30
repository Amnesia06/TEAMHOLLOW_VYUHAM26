import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "flat";
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = "default",
  ...props
}) => {
  const variantStyles = {
    default: "bg-surface border border-border shadow-card",
    elevated: "bg-surface border border-border shadow-float",
    flat: "bg-surface border border-border-light",
  };

  return (
    <div
      className={cn("rounded-2xl p-6 transition-all duration-200", variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
