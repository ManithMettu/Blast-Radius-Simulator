import { Graph } from "graphlib";
import { getServiceName } from "./graph-builder";

export function findDependencyPaths(
  graph: Graph,
  failedServiceId: string,
  impactedServiceId: string,
): string[][] {
  const paths: string[][] = [];
  const currentPath: string[] = [];

  function dfs(nodeId: string): void {
    if (nodeId === impactedServiceId) {
      paths.push([
        ...currentPath.map((id) => getServiceName(graph, id)),
        getServiceName(graph, impactedServiceId),
      ]);
      return;
    }

    currentPath.push(nodeId);
    const predecessors = graph.predecessors(nodeId) ?? [];

    for (const predecessor of predecessors) {
      if (!currentPath.includes(predecessor)) {
        dfs(predecessor);
      }
    }

    currentPath.pop();
  }

  dfs(failedServiceId);
  return paths;
}

export function findAllPathsToImpact(
  graph: Graph,
  failedServiceIds: string[],
  impactedServiceId: string,
): string[][] {
  const allPaths: string[][] = [];

  for (const failedId of failedServiceIds) {
    const paths = findDependencyPaths(graph, failedId, impactedServiceId);
    allPaths.push(...paths);
  }

  const unique = new Map<string, string[]>();
  for (const path of allPaths) {
    unique.set(path.join("->"), path);
  }

  return [...unique.values()];
}
