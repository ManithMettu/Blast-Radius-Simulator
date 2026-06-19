import { apiClient } from "@/lib/api-client";
import type { HealthSummary } from "@/types";

export const healthApi = {
  getSummary: async () => {
    const { data } = await apiClient.get<HealthSummary>("/health/summary");
    return data;
  },
};
