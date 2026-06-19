import { buildGraph } from "../engine/graph-builder";
import { dependencyRepository } from "../repositories/dependency.repository";
import { serviceRepository } from "../repositories/service.repository";
import type { GraphData } from "../types";

export const graphService = {
  async getGraphData(): Promise<GraphData> {
    const [services, edges] = await Promise.all([
      serviceRepository.findAllForGraph(),
      dependencyRepository.findAllEdges(),
    ]);

    return {
      nodes: services.map((service) => ({
        id: service.id,
        label: service.name,
        status: service.status,
        criticality: service.criticality,
        owner: service.owner,
      })),
      edges: edges.map((edge) => ({
        id: `${edge.dependentId}-${edge.dependencyId}`,
        source: edge.dependentId,
        target: edge.dependencyId,
      })),
    };
  },

  async getEngineGraph() {
    const [services, edges] = await Promise.all([
      serviceRepository.findAllForGraph(),
      dependencyRepository.findAllEdges(),
    ]);
    return buildGraph(services, edges);
  },
};
