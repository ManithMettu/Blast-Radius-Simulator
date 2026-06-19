import type { Prisma } from "@prisma/client";
import { parsePagination, toPaginated } from "../lib/pagination";
import { prisma } from "../lib/prisma";
import type { SimulationDTO, SimulationResult } from "../types";

function toDTO(simulation: {
  id: string;
  name: string | null;
  failedServiceIds: string[];
  totalImpacted: number;
  severityScore: number;
  results: unknown;
  createdAt: Date;
}): SimulationDTO {
  return {
    id: simulation.id,
    name: simulation.name,
    failedServiceIds: simulation.failedServiceIds,
    totalImpacted: simulation.totalImpacted,
    severityScore: simulation.severityScore,
    results: simulation.results as SimulationResult,
    createdAt: simulation.createdAt.toISOString(),
  };
}

export const simulationRepository = {
  async findAll(filters?: {
    search?: string;
    minSeverity?: number;
    minImpacted?: number;
    page?: number;
    pageSize?: number;
  }) {
    const where: Prisma.SimulationWhereInput = {};
    const { skip, take, page, pageSize } = parsePagination(
      filters?.page,
      filters?.pageSize,
    );

    if (filters?.search) {
      where.name = { contains: filters.search, mode: "insensitive" };
    }

    if (filters?.minSeverity !== undefined) {
      where.severityScore = { gte: filters.minSeverity };
    }

    if (filters?.minImpacted !== undefined) {
      where.totalImpacted = { gte: filters.minImpacted };
    }

    const [simulations, total] = await Promise.all([
      prisma.simulation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.simulation.count({ where }),
    ]);

    return toPaginated(simulations.map(toDTO), total, page, pageSize);
  },

  async findById(id: string) {
    const simulation = await prisma.simulation.findUnique({ where: { id } });
    return simulation ? toDTO(simulation) : null;
  },

  async create(data: {
    name?: string;
    failedServiceIds: string[];
    totalImpacted: number;
    severityScore: number;
    results: SimulationResult;
  }) {
    const simulation = await prisma.simulation.create({
      data: {
        name: data.name,
        failedServiceIds: data.failedServiceIds,
        totalImpacted: data.totalImpacted,
        severityScore: data.severityScore,
        results: data.results as unknown as Prisma.InputJsonValue,
      },
    });
    return toDTO(simulation);
  },
};
