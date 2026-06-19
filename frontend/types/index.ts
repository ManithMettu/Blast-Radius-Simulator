export type ServiceStatus = "HEALTHY" | "DEGRADED" | "FAILED";
export type Criticality = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  owner?: string | null;
  criticality: Criticality;
  status: ServiceStatus;
  dependencyCount?: number;
  dependentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Dependency {
  id: string;
  dependentId: string;
  dependencyId: string;
  dependent?: Pick<Service, "id" | "name" | "status">;
  dependency?: Pick<Service, "id" | "name" | "status">;
  createdAt: string;
}

export interface GraphNode {
  id: string;
  label: string;
  status: ServiceStatus;
  criticality: Criticality;
  owner?: string | null;
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

export interface Simulation {
  id: string;
  name?: string | null;
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

export interface CreateServiceInput {
  name: string;
  description?: string;
  owner?: string;
  criticality?: Criticality;
  status?: ServiceStatus;
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {}

export interface CreateDependencyInput {
  dependentId: string;
  dependencyId: string;
}

export interface RunSimulationInput {
  failedServiceIds: string[];
  name?: string;
}

export interface ServiceFilters {
  search?: string;
  status?: ServiceStatus | "ALL";
  criticality?: Criticality | "ALL";
  owner?: string;
  minDependencyCount?: number;
  page?: number;
  pageSize?: number;
}

export interface SimulationFilters {
  search?: string;
  minSeverity?: number;
  minImpacted?: number;
  page?: number;
  pageSize?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
