"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { dependenciesApi } from "@/services/api/dependencies.api";
import type { CreateDependencyInput } from "@/types";

export function useDependencies() {
  return useQuery({
    queryKey: queryKeys.dependencies.list(),
    queryFn: () => dependenciesApi.getAll(),
  });
}

export function useServiceDependencies(serviceId: string) {
  return useQuery({
    queryKey: queryKeys.dependencies.byService(serviceId),
    queryFn: () => dependenciesApi.getByService(serviceId),
    enabled: Boolean(serviceId),
  });
}

export function useCreateDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDependencyInput) => dependenciesApi.create(input),
    onSuccess: () => {
      toast.success("Dependency created");
      queryClient.invalidateQueries({ queryKey: queryKeys.dependencies.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dependenciesApi.remove(id),
    onSuccess: () => {
      toast.success("Dependency removed");
      queryClient.invalidateQueries({ queryKey: queryKeys.dependencies.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDetectCycle() {
  return useMutation({
    mutationFn: ({
      dependentId,
      dependencyId,
    }: {
      dependentId: string;
      dependencyId: string;
    }) => dependenciesApi.detectCycle(dependentId, dependencyId),
  });
}
