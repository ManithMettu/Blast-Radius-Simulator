import { apiClient } from "@/lib/api-client";
import type {
  CreateDependencyInput,
  CycleDetectionResult,
  Dependency,
} from "@/types";

export const dependenciesApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Dependency[]>("/dependencies");
    return data;
  },

  getByService: async (serviceId: string) => {
    const { data } = await apiClient.get<Dependency[]>(
      `/dependencies/service/${serviceId}`,
    );
    return data;
  },

  create: async (input: CreateDependencyInput) => {
    const { data } = await apiClient.post<Dependency>("/dependencies", input);
    return data;
  },

  remove: async (id: string) => {
    await apiClient.delete(`/dependencies/${id}`);
  },

  detectCycle: async (dependentId: string, dependencyId: string) => {
    const { data } = await apiClient.post<CycleDetectionResult>(
      "/dependencies/detect-cycle",
      { dependentId, dependencyId },
    );
    return data;
  },
};
