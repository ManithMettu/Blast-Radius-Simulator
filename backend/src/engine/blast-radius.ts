import { Graph } from "graphlib";
import type { ImpactedService, SimulationResult } from "../types";
import { getServiceName } from "./graph-builder";
import { calculateOverallSeverity, calculateSeverity, getCriticality } from "./impact-scoring";
import { findAllPathsToImpact } from "./path-finding";

export interface BlastRadiusOptions {
  onImpact?: (impact: ImpactedService) => void | Promise<void>;
}

export function computeBlastRadius(
  graph: Graph,
  failedServiceIds: string[],
  options?: BlastRadiusOptions,
): SimulationResult {
  const failedSet = new Set(failedServiceIds);
  const impactedMap = new Map<
    string,
    { depth: number; direct: boolean; paths: string[][] }
  >();

  for (const failedId of failedServiceIds) {
    const queue: Array<{ id: string; depth: number }> = [
      { id: failedId, depth: 0 },
    ];
    const visited = new Set<string>([failedId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = graph.predecessors(current.id) ?? [];

      for (const dependentId of dependents) {
        if (failedSet.has(dependentId) || visited.has(dependentId)) continue;

        visited.add(dependentId);
        const depth = current.depth + 1;
        const direct = depth === 1;

        const existing = impactedMap.get(dependentId);
        if (!existing || depth < existing.depth) {
          impactedMap.set(dependentId, {
            depth,
            direct,
            paths: findAllPathsToImpact(graph, failedServiceIds, dependentId),
          });
        }

        queue.push({ id: dependentId, depth });
      }
    }
  }

  const impacted: ImpactedService[] = [];

  for (const [serviceId, meta] of impactedMap) {
    const criticality = getCriticality(graph, serviceId);
    const severity = calculateSeverity(
      meta.depth,
      criticality,
      meta.paths.length,
    );

    const impact: ImpactedService = {
      serviceId,
      serviceName: getServiceName(graph, serviceId),
      depth: meta.depth,
      severity,
      paths: meta.paths,
      direct: meta.direct,
    };

    impacted.push(impact);
    options?.onImpact?.(impact);
  }

  impacted.sort((a, b) => b.severity - a.severity || a.depth - b.depth);

  const directlyImpacted = impacted
    .filter((item) => item.direct)
    .map((item) => item.serviceId);
  const indirectlyImpacted = impacted
    .filter((item) => !item.direct)
    .map((item) => item.serviceId);

  return {
    impacted,
    directlyImpacted,
    indirectlyImpacted,
    blastRadius: impacted.length,
  };
}

export async function computeBlastRadiusAsync(
  graph: Graph,
  failedServiceIds: string[],
  options?: BlastRadiusOptions,
): Promise<SimulationResult> {
  const failedSet = new Set(failedServiceIds);
  const impactedMap = new Map<
    string,
    { depth: number; direct: boolean; paths: string[][] }
  >();

  for (const failedId of failedServiceIds) {
    const queue: Array<{ id: string; depth: number }> = [
      { id: failedId, depth: 0 },
    ];
    const visited = new Set<string>([failedId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = graph.predecessors(current.id) ?? [];

      for (const dependentId of dependents) {
        if (failedSet.has(dependentId) || visited.has(dependentId)) continue;

        visited.add(dependentId);
        const depth = current.depth + 1;
        const direct = depth === 1;

        const existing = impactedMap.get(dependentId);
        if (!existing || depth < existing.depth) {
          impactedMap.set(dependentId, {
            depth,
            direct,
            paths: findAllPathsToImpact(graph, failedServiceIds, dependentId),
          });
        }

        queue.push({ id: dependentId, depth });
      }
    }
  }

  const impacted: ImpactedService[] = [];

  for (const [serviceId, meta] of impactedMap) {
    const criticality = getCriticality(graph, serviceId);
    const severity = calculateSeverity(
      meta.depth,
      criticality,
      meta.paths.length,
    );

    const impact: ImpactedService = {
      serviceId,
      serviceName: getServiceName(graph, serviceId),
      depth: meta.depth,
      severity,
      paths: meta.paths,
      direct: meta.direct,
    };

    impacted.push(impact);
    await options?.onImpact?.(impact);

    // Small delay for real-time streaming effect
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  impacted.sort((a, b) => b.severity - a.severity || a.depth - b.depth);

  return {
    impacted,
    directlyImpacted: impacted.filter((i) => i.direct).map((i) => i.serviceId),
    indirectlyImpacted: impacted
      .filter((i) => !i.direct)
      .map((i) => i.serviceId),
    blastRadius: impacted.length,
  };
}

export { calculateOverallSeverity };
