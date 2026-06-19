import { Graph } from "graphlib";
import type { ServiceGraphEdge, ServiceGraphNode } from "../types";

export function buildGraph(
  services: ServiceGraphNode[],
  dependencies: ServiceGraphEdge[],
): Graph {
  const graph = new Graph({ directed: true });

  for (const service of services) {
    graph.setNode(service.id, service);
  }

  for (const dep of dependencies) {
    graph.setEdge(dep.dependentId, dep.dependencyId);
  }

  return graph;
}

export function getServiceName(
  graph: Graph,
  serviceId: string,
): string {
  const node = graph.node(serviceId) as ServiceGraphNode | undefined;
  return node?.name ?? serviceId;
}
