import { apiClient } from "@/lib/api-client";
import type {
  CreateServiceInput,
  PaginatedResponse,
  Service,
  ServiceFilters,
  UpdateServiceInput,
} from "@/types";

export const servicesApi = {
  getAll: async (filters?: ServiceFilters) => {
    const { data } = await apiClient.get<PaginatedResponse<Service>>("/services", {
      params: filters,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Service>(`/services/${id}`);
    return data;
  },

  create: async (input: CreateServiceInput) => {
    const { data } = await apiClient.post<Service>("/services", input);
    return data;
  },

  update: async (id: string, input: UpdateServiceInput) => {
    const { data } = await apiClient.patch<Service>(`/services/${id}`, input);
    return data;
  },

  remove: async (id: string) => {
    await apiClient.delete(`/services/${id}`);
  },
};
