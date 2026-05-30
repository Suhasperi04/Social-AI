import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-accent-emerald";
  if (score >= 60) return "text-accent-amber";
  if (score >= 40) return "text-brand-400";
  return "text-accent-red";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-accent-emerald/10";
  if (score >= 60) return "bg-accent-amber/10";
  if (score >= 40) return "bg-brand-400/10";
  return "bg-accent-red/10";
}

export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "high":
    case "critical":
      return "text-accent-red";
    case "medium":
      return "text-accent-amber";
    case "low":
      return "text-accent-emerald";
    default:
      return "text-text-secondary";
  }
}

export function getEngagementRate(
  likes: number,
  comments: number,
  followers: number
): number {
  if (followers === 0) return 0;
  return Number((((likes + comments) / followers) * 100).toFixed(2));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}
