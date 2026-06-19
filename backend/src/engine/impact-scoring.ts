import { Graph } from "graphlib";
import type { Criticality } from "../types";

const CRITICALITY_WEIGHT: Record<Criticality, number> = {
  LOW: 10,
  MEDIUM: 20,
  HIGH: 35,
  CRITICAL: 50,
};

export function calculateSeverity(
  depth: number,
  criticality: Criticality,
  pathCount: number,
): number {
  const depthPenalty = Math.max(0, 100 - depth * 20);
  const criticalityBonus = CRITICALITY_WEIGHT[criticality];
  const pathMultiplier = Math.min(1.5, 1 + pathCount * 0.1);

  return Math.round(
    Math.min(100, (depthPenalty * 0.4 + criticalityBonus) * pathMultiplier),
  );
}

export function calculateOverallSeverity(impacted: { severity: number }[]): number {
  if (!impacted.length) return 0;
  const total = impacted.reduce((sum, item) => sum + item.severity, 0);
  return Math.round((total / impacted.length) * 100) / 100;
}

export function getCriticality(graph: Graph, serviceId: string): Criticality {
  const node = graph.node(serviceId) as { criticality?: Criticality } | undefined;
  return node?.criticality ?? "MEDIUM";
}
