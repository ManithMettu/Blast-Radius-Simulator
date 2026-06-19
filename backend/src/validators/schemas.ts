import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  owner: z.string().max(100).optional(),
  criticality: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["HEALTHY", "DEGRADED", "FAILED"]).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export const serviceFiltersSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(["HEALTHY", "DEGRADED", "FAILED", "ALL"]).optional(),
  criticality: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL", "ALL"]).optional(),
  owner: z.string().optional(),
  minDependencyCount: z.coerce.number().int().min(0).optional(),
});

export const simulationFiltersSchema = paginationSchema.extend({
  search: z.string().optional(),
  minSeverity: z.coerce.number().min(0).max(100).optional(),
  minImpacted: z.coerce.number().int().min(0).optional(),
});

export const createDependencySchema = z.object({
  dependentId: z.string().min(1),
  dependencyId: z.string().min(1),
});

export const detectCycleSchema = z.object({
  dependentId: z.string().min(1),
  dependencyId: z.string().min(1),
});

export const runSimulationSchema = z.object({
  failedServiceIds: z.array(z.string().min(1)).min(1),
  name: z.string().max(200).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const serviceIdParamSchema = z.object({
  serviceId: z.string().min(1),
});
