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
    default: "bg-surface border border-border shadow-card hover:shadow-float",
    elevated: "bg-surface border border-border shadow-float hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
    flat: "bg-surface border border-border-light hover:border-border",
  };

  return (
    <div
      className={cn("rounded-2xl p-6 transition-all duration-200 ease-out", variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
