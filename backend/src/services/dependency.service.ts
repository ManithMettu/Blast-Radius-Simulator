import { buildGraph } from "../engine/graph-builder";
import { detectCycle } from "../engine/cycle-detection";
import { dependencyRepository } from "../repositories/dependency.repository";
import { serviceRepository } from "../repositories/service.repository";
import { AppError } from "../types";
import type { z } from "zod";
import type { createDependencySchema } from "../validators/schemas";

type CreateInput = z.infer<typeof createDependencySchema>;

export const dependencyService = {
  async list() {
    return dependencyRepository.findAll();
  },

  async listByService(serviceId: string) {
    await serviceRepository.findById(serviceId).then((s) => {
      if (!s) throw new AppError(404, "Service not found", "SERVICE_NOT_FOUND");
    });
    return dependencyRepository.findByService(serviceId);
  },

  async create(input: CreateInput) {
    const { dependentId, dependencyId } = input;

    if (dependentId === dependencyId) {
      throw new AppError(
        400,
        "A service cannot depend on itself",
        "SELF_DEPENDENCY",
      );
    }

    const [dependent, dependency] = await Promise.all([
      serviceRepository.findById(dependentId),
      serviceRepository.findById(dependencyId),
    ]);

    if (!dependent) {
      throw new AppError(404, "Dependent service not found", "SERVICE_NOT_FOUND");
    }
    if (!dependency) {
      throw new AppError(404, "Dependency service not found", "SERVICE_NOT_FOUND");
    }

    const cycle = await this.checkCycle(dependentId, dependencyId);
    if (cycle.hasCycle) {
      throw new AppError(
        400,
        `Circular dependency detected: ${cycle.cycle?.join(" → ")}`,
        "CIRCULAR_DEPENDENCY",
        cycle,
      );
    }

    return dependencyRepository.create(dependentId, dependencyId);
  },

  async remove(id: string) {
    const dep = await dependencyRepository.findById(id);
    if (!dep) {
      throw new AppError(404, "Dependency not found", "DEPENDENCY_NOT_FOUND");
    }
    await dependencyRepository.remove(id);
  },

  async checkCycle(dependentId: string, dependencyId: string) {
    const [services, edges] = await Promise.all([
      serviceRepository.findAllForGraph(),
      dependencyRepository.findAllEdges(),
    ]);

    const graph = buildGraph(services, edges);
    return detectCycle(graph, dependentId, dependencyId);
  },
};
