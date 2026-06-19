import { apiClient } from "@/lib/api-client";
import type { GraphData } from "@/types";

export const graphApi = {
  getGraph: async () => {
    const { data } = await apiClient.get<GraphData>("/graph");
    return data;
  },
};
