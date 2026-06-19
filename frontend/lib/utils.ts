import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Criticality, ServiceStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatPercent(value: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  HEALTHY: "Healthy",
  DEGRADED: "Degraded",
  FAILED: "Failed",
};

export const CRITICALITY_LABELS: Record<Criticality, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export function statusColor(status: ServiceStatus) {
  switch (status) {
    case "HEALTHY":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "DEGRADED":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "FAILED":
      return "text-rose-700 bg-rose-50 border-rose-200";
  }
}

export function criticalityColor(criticality: Criticality) {
  switch (criticality) {
    case "LOW":
      return "text-slate-600 bg-slate-100 border-slate-200";
    case "MEDIUM":
      return "text-sky-700 bg-sky-50 border-sky-200";
    case "HIGH":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "CRITICAL":
      return "text-rose-700 bg-rose-50 border-rose-200";
  }
}

export function severityColor(score: number) {
  if (score >= 75) return "text-rose-600";
  if (score >= 50) return "text-orange-600";
  if (score >= 25) return "text-amber-600";
  return "text-emerald-600";
}
