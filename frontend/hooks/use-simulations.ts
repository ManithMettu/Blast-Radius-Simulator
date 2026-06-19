"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { simulationsApi } from "@/services/api/simulations.api";
import { useSimulationStore } from "@/stores/simulation-store";
import type { RunSimulationInput, SimulationFilters } from "@/types";

export function useSimulations(filters?: SimulationFilters) {
  return useQuery({
    queryKey: queryKeys.simulations.list(filters),
    queryFn: () => simulationsApi.getAll(filters),
  });
}

export function useSimulation(id: string) {
  return useQuery({
    queryKey: queryKeys.simulations.detail(id),
    queryFn: () => simulationsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useRunSimulation() {
  const queryClient = useQueryClient();
  const { setActiveResult, setIsSimulating, resetSimulationProgress } =
    useSimulationStore();

  return useMutation({
    mutationFn: (input: RunSimulationInput) => simulationsApi.run(input),
    onMutate: () => {
      resetSimulationProgress();
      setIsSimulating(true);
    },
    onSuccess: (simulation) => {
      setActiveResult(simulation.results);
      toast.success(
        `Simulation complete — ${simulation.totalImpacted} services impacted`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.simulations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.health.all });
    },
    onError: (error: Error) => toast.error(error.message),
    onSettled: () => setIsSimulating(false),
  });
}
