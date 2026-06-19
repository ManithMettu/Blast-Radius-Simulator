"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { servicesApi } from "@/services/api/services.api";
import type { CreateServiceInput, ServiceFilters, UpdateServiceInput } from "@/types";

export function useServices(filters?: ServiceFilters) {
  return useQuery({
    queryKey: queryKeys.services.list(filters),
    queryFn: () => servicesApi.getAll(filters),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: () => servicesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateServiceInput) => servicesApi.create(input),
    onSuccess: (service) => {
      toast.success(`Service "${service.name}" created`);
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.health.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateServiceInput }) =>
      servicesApi.update(id, input),
    onSuccess: (service, { id }) => {
      toast.success(`Service "${service.name}" updated`);
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.health.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => {
      toast.success("Service deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dependencies.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.graph.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.health.all });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
