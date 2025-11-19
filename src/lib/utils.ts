import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format shop types array to display string
 * @param types - Array of shop type values
 * @returns Formatted string (e.g., "가챠, 클로우")
 */
export function formatShopTypes(types: string[]): string {
  const labels: Record<string, string> = {
    gacha: "가챠",
    figure: "피규어",
    claw: "클로우",
  };

  return types.map(t => labels[t] || t).join(", ");
}
