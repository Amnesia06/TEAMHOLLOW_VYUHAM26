import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-2xl p-5 shadow-card transition-all duration-200",
        hoverEffect && "hover:shadow-float hover:border-secondary/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
