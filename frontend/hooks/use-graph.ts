"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { graphApi } from "@/services/api/graph.api";

export function useGraph() {
  return useQuery({
    queryKey: queryKeys.graph.data(),
    queryFn: () => graphApi.getGraph(),
  });
}
