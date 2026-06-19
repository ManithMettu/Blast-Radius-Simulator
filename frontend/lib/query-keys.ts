import type { ServiceFilters } from "@/types";

export const queryKeys = {
  services: {
    all: ["services"] as const,
    lists: () => [...queryKeys.services.all, "list"] as const,
    list: (filters?: ServiceFilters) =>
      [...queryKeys.services.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.services.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.services.details(), id] as const,
  },
  dependencies: {
    all: ["dependencies"] as const,
    lists: () => [...queryKeys.dependencies.all, "list"] as const,
    list: () => [...queryKeys.dependencies.lists()] as const,
    byService: (serviceId: string) =>
      [...queryKeys.dependencies.all, "service", serviceId] as const,
  },
  graph: {
    all: ["graph"] as const,
    data: () => [...queryKeys.graph.all, "data"] as const,
  },
  simulations: {
    all: ["simulations"] as const,
    lists: () => [...queryKeys.simulations.all, "list"] as const,
    list: (filters?: import("@/types").SimulationFilters) =>
      [...queryKeys.simulations.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.simulations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.simulations.details(), id] as const,
  },
  health: {
    all: ["health"] as const,
    summary: () => [...queryKeys.health.all, "summary"] as const,
  },
} as const;
