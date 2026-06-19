import { Graph } from "graphlib";
import type { CycleDetectionResult } from "../types";
import { getServiceName } from "./graph-builder";

export function detectCycle(
  graph: Graph,
  dependentId: string,
  dependencyId: string,
): CycleDetectionResult {
  if (dependentId === dependencyId) {
    const name = getServiceName(graph, dependentId);
    return { hasCycle: true, cycle: [name, name] };
  }

  const visited = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string): boolean {
    if (nodeId === dependentId) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    path.push(nodeId);

    const successors = graph.successors(nodeId) ?? [];
    for (const next of successors) {
      if (dfs(next)) return true;
    }

    path.pop();
    return false;
  }

  if (dfs(dependencyId)) {
    const cycleNames = [
      ...path.map((id) => getServiceName(graph, id)),
      getServiceName(graph, dependentId),
    ];
    return { hasCycle: true, cycle: cycleNames };
  }

  return { hasCycle: false };
}
