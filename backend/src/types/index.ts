export type ServiceStatus = "HEALTHY" | "DEGRADED" | "FAILED";
export type Criticality = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ServiceDTO {
  id: string;
  name: string;
  description: string | null;
  owner: string | null;
  criticality: Criticality;
  status: ServiceStatus;
  dependencyCount?: number;
  dependentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DependencyDTO {
  id: string;
  dependentId: string;
  dependencyId: string;
  dependent?: { id: string; name: string; status: ServiceStatus };
  dependency?: { id: string; name: string; status: ServiceStatus };
  createdAt: string;
}

export interface GraphNode {
  id: string;
  label: string;
  status: ServiceStatus;
  criticality: Criticality;
  owner: string | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ImpactedService {
  serviceId: string;
  serviceName: string;
  depth: number;
  severity: number;
  paths: string[][];
  direct: boolean;
}

export interface SimulationResult {
  impacted: ImpactedService[];
  directlyImpacted: string[];
  indirectlyImpacted: string[];
  blastRadius: number;
}

export interface SimulationDTO {
  id: string;
  name: string | null;
  failedServiceIds: string[];
  totalImpacted: number;
  severityScore: number;
  results: SimulationResult;
  createdAt: string;
}

export interface HealthSummary {
  total: number;
  healthy: number;
  degraded: number;
  failed: number;
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycle?: string[];
}

export interface ServiceGraphNode {
  id: string;
  name: string;
  criticality: Criticality;
}

export interface ServiceGraphEdge {
  dependentId: string;
  dependencyId: string;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}
