import type { Criticality, ServiceStatus } from "@/types";

export const APP_NAME = "Blast Radius Simulator";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/services", label: "Services", icon: "Server" },
  { href: "/dependencies", label: "Dependencies", icon: "GitBranch" },
  { href: "/graph", label: "Graph", icon: "Network" },
  { href: "/simulations", label: "Simulations", icon: "Zap" },
  { href: "/history", label: "History", icon: "History" },
] as const;

export const SERVICE_STATUSES: ServiceStatus[] = [
  "HEALTHY",
  "DEGRADED",
  "FAILED",
];

export const CRITICALITY_LEVELS: Criticality[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];
