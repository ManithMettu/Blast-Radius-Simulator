"use client";

import { useServices } from "@/hooks/use-services";
import { useRunSimulation } from "@/hooks/use-simulations";
import { useSimulationStore } from "@/stores/simulation-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useState } from "react";

export function SimulationPanel() {
  const [name, setName] = useState("");
  const services = useServices();
  const runSimulation = useRunSimulation();
  const {
    selectedServiceIds,
    toggleService,
    clearSelection,
    isSimulating,
  } = useSimulationStore();

  if (services.isLoading) return <LoadingState label="Loading services..." />;
  if (services.isError) {
    return (
      <ErrorState
        message={services.error?.message ?? "Failed to load services"}
        onRetry={() => services.refetch()}
      />
    );
  }

  const handleRun = async () => {
    if (!selectedServiceIds.length) return;
    await runSimulation.mutateAsync({
      failedServiceIds: selectedServiceIds,
      name: name || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Failure simulation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="grid gap-2 text-sm">
          <span className="text-slate-700">Simulation name (optional)</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Checkout outage drill"
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm text-slate-700">Select failed services</p>
          <div className="grid max-h-64 gap-2 overflow-auto">
            {(services.data?.data ?? []).map((service) => {
              const selected = selectedServiceIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "border-rose-300 bg-rose-50 text-rose-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {service.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRun}
            isLoading={isSimulating || runSimulation.isPending}
            disabled={!selectedServiceIds.length}
          >
            Run simulation
          </Button>
          <Button variant="outline" onClick={clearSelection}>
            Clear
          </Button>
        </div>

        {runSimulation.error ? (
          <p className="text-sm text-rose-400">{runSimulation.error.message}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
