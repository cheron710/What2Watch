// src/lib/utils/cn.ts
// Merge conditional class names, de-duplicating conflicting Tailwind utilities.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
