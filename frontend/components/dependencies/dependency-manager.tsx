"use client";

import { useState } from "react";
import { useDependencies, useCreateDependency, useDeleteDependency, useDetectCycle } from "@/hooks/use-dependencies";
import { useServices } from "@/hooks/use-services";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingState, EmptyState } from "@/components/ui/states";
import { AlertTriangle, Trash2 } from "lucide-react";

export function DependencyManager() {
  const [dependentId, setDependentId] = useState("");
  const [dependencyId, setDependencyId] = useState("");
  const [cycleWarning, setCycleWarning] = useState<string | null>(null);

  const services = useServices();
  const dependencies = useDependencies();
  const createDependency = useCreateDependency();
  const deleteDependency = useDeleteDependency();
  const detectCycle = useDetectCycle();

  const handleCreate = async () => {
    if (!dependentId || !dependencyId || dependentId === dependencyId) return;

    const cycle = await detectCycle.mutateAsync({ dependentId, dependencyId });
    if (cycle.hasCycle) {
      setCycleWarning(cycle.cycle?.join(" → ") ?? "Circular dependency detected");
      return;
    }

    setCycleWarning(null);
    await createDependency.mutateAsync({ dependentId, dependencyId });
    setDependentId("");
    setDependencyId("");
  };

  if (services.isLoading || dependencies.isLoading) {
    return <LoadingState label="Loading dependencies..." />;
  }

  if (services.isError || dependencies.isError) {
    return (
      <ErrorState
        message="Failed to load dependency data"
        onRetry={() => {
          services.refetch();
          dependencies.refetch();
        }}
      />
    );
  }

  const serviceOptions = services.data?.data ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Add dependency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-700">Dependent service</span>
            <Select value={dependentId} onChange={(e) => setDependentId(e.target.value)}>
              <option value="">Select service</option>
              {serviceOptions.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-700">Depends on</span>
            <Select value={dependencyId} onChange={(e) => setDependencyId(e.target.value)}>
              <option value="">Select dependency</option>
              {serviceOptions.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
          </label>

          {cycleWarning ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Circular dependency: {cycleWarning}</span>
            </div>
          ) : null}

          <Button
            onClick={handleCreate}
            isLoading={createDependency.isPending || detectCycle.isPending}
            disabled={!dependentId || !dependencyId}
          >
            Create dependency
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dependency map</CardTitle>
        </CardHeader>
        <CardContent>
          {!dependencies.data?.length ? (
            <EmptyState
              title="No dependencies defined"
              description="Link services together to model upstream and downstream relationships."
            />
          ) : (
            <div className="space-y-3">
              {dependencies.data.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm text-slate-700">
                    <span className="font-medium text-slate-900">
                      {dep.dependent?.name ?? dep.dependentId}
                    </span>
                    <span className="mx-2 text-slate-600">→</span>
                    <span className="font-medium text-sky-300">
                      {dep.dependency?.name ?? dep.dependencyId}
                    </span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDependency.mutate(dep.id)}
                  >
                    <Trash2 className="h-4 w-4 text-rose-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
