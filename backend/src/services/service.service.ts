import { serviceRepository } from "../repositories/service.repository";
import { AppError } from "../types";
import type { z } from "zod";
import type { createServiceSchema, serviceFiltersSchema, updateServiceSchema } from "../validators/schemas";

type CreateInput = z.infer<typeof createServiceSchema>;
type UpdateInput = z.infer<typeof updateServiceSchema>;
type Filters = z.infer<typeof serviceFiltersSchema>;

export const serviceService = {
  async list(filters?: Filters) {
    return serviceRepository.findAll(filters);
  },

  async getById(id: string) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new AppError(404, "Service not found", "SERVICE_NOT_FOUND");
    }
    return service;
  },

  async create(input: CreateInput) {
    const existing = await serviceRepository.findByName(input.name);
    if (existing) {
      throw new AppError(409, "Service name already exists", "DUPLICATE_NAME");
    }

    return serviceRepository.create({
      name: input.name,
      description: input.description,
      owner: input.owner,
      criticality: input.criticality,
      status: input.status,
    });
  },

  async update(id: string, input: UpdateInput) {
    await this.getById(id);

    if (input.name) {
      const existing = await serviceRepository.findByName(input.name);
      if (existing && existing.id !== id) {
        throw new AppError(409, "Service name already exists", "DUPLICATE_NAME");
      }
    }

    return serviceRepository.update(id, input);
  },

  async remove(id: string) {
    await this.getById(id);
    await serviceRepository.remove(id);
  },
};
