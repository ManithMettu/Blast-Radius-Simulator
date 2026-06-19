import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResponse,
  RunSimulationInput,
  Simulation,
  SimulationFilters,
} from "@/types";

export const simulationsApi = {
  getAll: async (filters?: SimulationFilters) => {
    const { data } = await apiClient.get<PaginatedResponse<Simulation>>(
      "/simulations",
      { params: filters },
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Simulation>(`/simulations/${id}`);
    return data;
  },

  run: async (input: RunSimulationInput) => {
    const { data } = await apiClient.post<Simulation>("/simulations/run", input);
    return data;
  },
};
