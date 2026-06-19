"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { healthApi } from "@/services/api/health.api";

export function useHealthSummary() {
  return useQuery({
    queryKey: queryKeys.health.summary(),
    queryFn: () => healthApi.getSummary(),
  });
}
