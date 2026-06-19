import { prisma } from "../lib/prisma";
import type { DependencyDTO } from "../types";

function toDTO(
  dep: Awaited<ReturnType<typeof prisma.dependency.findFirst>> & {
    dependent: { id: string; name: string; status: string };
    dependency: { id: string; name: string; status: string };
  },
): DependencyDTO {
  return {
    id: dep.id,
    dependentId: dep.dependentId,
    dependencyId: dep.dependencyId,
    dependent: {
      id: dep.dependent.id,
      name: dep.dependent.name,
      status: dep.dependent.status as DependencyDTO["dependent"] extends infer T
        ? T extends { status: infer S }
          ? S
          : never
        : never,
    },
    dependency: {
      id: dep.dependency.id,
      name: dep.dependency.name,
      status: dep.dependency.status as DependencyDTO["dependency"] extends infer T
        ? T extends { status: infer S }
          ? S
          : never
        : never,
    },
    createdAt: dep.createdAt.toISOString(),
  };
}

const include = {
  dependent: { select: { id: true, name: true, status: true } },
  dependency: { select: { id: true, name: true, status: true } },
} as const;

export const dependencyRepository = {
  async findAll() {
    const deps = await prisma.dependency.findMany({
      include,
      orderBy: { createdAt: "desc" },
    });
    return deps.map(toDTO);
  },

  async findByService(serviceId: string) {
    const deps = await prisma.dependency.findMany({
      where: {
        OR: [{ dependentId: serviceId }, { dependencyId: serviceId }],
      },
      include,
      orderBy: { createdAt: "desc" },
    });
    return deps.map(toDTO);
  },

  async findById(id: string) {
    return prisma.dependency.findUnique({ where: { id }, include });
  },

  async create(dependentId: string, dependencyId: string) {
    const dep = await prisma.dependency.create({
      data: { dependentId, dependencyId },
      include,
    });
    return toDTO(dep);
  },

  async remove(id: string) {
    await prisma.dependency.delete({ where: { id } });
  },

  async findAllEdges() {
    return prisma.dependency.findMany({
      select: { dependentId: true, dependencyId: true },
    });
  },
};
