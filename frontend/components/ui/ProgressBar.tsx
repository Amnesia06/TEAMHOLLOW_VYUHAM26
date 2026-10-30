import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number; // 0 to 100
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning";
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = "md",
  color = "primary",
  className,
  showLabel = false,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  const colorStyles = {
    primary: "bg-primary",
    success: "bg-accent-green",
    warning: "bg-accent-amber",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-border-light rounded-full overflow-hidden", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorStyles[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-text-muted mt-1">
          <span>Progress</span>
          <span className="font-medium text-text">{Math.round(clamped)}%</span>
        </div>
      )}
    </div>
  );
};
