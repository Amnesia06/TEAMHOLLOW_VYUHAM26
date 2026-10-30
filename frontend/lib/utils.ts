import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getProficiencyBadgeClass(level: string): string {
  switch (level.toLowerCase()) {
    case "expert":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "advanced":
      return "bg-accent-blueSubtle text-accent-blue border-blue-200";
    case "intermediate":
      return "bg-accent-greenSubtle text-accent-green border-emerald-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

export function getImportanceBadgeClass(importance: string): string {
  switch (importance.toLowerCase()) {
    case "required":
      return "bg-accent-roseSubtle text-accent-rose border-rose-200";
    case "emerging":
      return "bg-purple-50 text-primary border-purple-200";
    default:
      return "bg-accent-amberSubtle text-accent-amber border-amber-200";
  }
}
