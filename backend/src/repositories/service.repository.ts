import type { Prisma } from "@prisma/client";
import { parsePagination, toPaginated } from "../lib/pagination";
import { prisma } from "../lib/prisma";
import type { ServiceDTO } from "../types";

function toDTO(
  service: Prisma.ServiceGetPayload<{
    include: { _count: { select: { dependencies: true; dependents: true } } };
  }>,
): ServiceDTO {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    owner: service.owner,
    criticality: service.criticality,
    status: service.status,
    dependencyCount: service._count.dependencies,
    dependentCount: service._count.dependents,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

export const serviceRepository = {
  async findAll(filters?: {
    search?: string;
    status?: string;
    criticality?: string;
    owner?: string;
    minDependencyCount?: number;
    page?: number;
    pageSize?: number;
  }) {
    const where: Prisma.ServiceWhereInput = {};
    const { skip, take, page, pageSize } = parsePagination(
      filters?.page,
      filters?.pageSize,
    );

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status as Prisma.EnumServiceStatusFilter;
    }

    if (filters?.criticality && filters.criticality !== "ALL") {
      where.criticality = filters.criticality as Prisma.EnumCriticalityFilter;
    }

    if (filters?.owner) {
      where.owner = { contains: filters.owner, mode: "insensitive" };
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          _count: { select: { dependencies: true, dependents: true } },
        },
        orderBy: { name: "asc" },
        skip,
        take,
      }),
      prisma.service.count({ where }),
    ]);

    let data = services.map(toDTO);

    if (filters?.minDependencyCount !== undefined) {
      data = data.filter(
        (service) =>
          (service.dependencyCount ?? 0) >= filters.minDependencyCount!,
      );
    }

    return toPaginated(data, total, page, pageSize);
  },

  async findById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: { select: { dependencies: true, dependents: true } },
      },
    });

    return service ? toDTO(service) : null;
  },

  async findByName(name: string) {
    return prisma.service.findUnique({ where: { name } });
  },

  async create(data: Prisma.ServiceCreateInput) {
    const service = await prisma.service.create({
      data,
      include: {
        _count: { select: { dependencies: true, dependents: true } },
      },
    });
    return toDTO(service);
  },

  async update(id: string, data: Prisma.ServiceUpdateInput) {
    const service = await prisma.service.update({
      where: { id },
      data,
      include: {
        _count: { select: { dependencies: true, dependents: true } },
      },
    });
    return toDTO(service);
  },

  async remove(id: string) {
    await prisma.service.delete({ where: { id } });
  },

  async findAllForGraph() {
    return prisma.service.findMany({
      select: { id: true, name: true, criticality: true, status: true, owner: true },
    });
  },

  async countByStatus() {
    const groups = await prisma.service.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const counts = {
      total: 0,
      healthy: 0,
      degraded: 0,
      failed: 0,
    };

    for (const group of groups) {
      counts.total += group._count._all;
      if (group.status === "HEALTHY") counts.healthy = group._count._all;
      if (group.status === "DEGRADED") counts.degraded = group._count._all;
      if (group.status === "FAILED") counts.failed = group._count._all;
    }

    return counts;
  },
};
