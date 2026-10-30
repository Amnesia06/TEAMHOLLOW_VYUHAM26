import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  label,
}) => {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div className={cn("flex items-center gap-2 text-text-muted", className)}>
      <div
        className={cn(
          "rounded-full border-border border-t-primary animate-spin",
          sizeMap[size]
        )}
      />
      {label && <span className="text-xs font-medium">{label}</span>}
    </div>
  );
};
