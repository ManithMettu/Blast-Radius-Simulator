"use client";

import { useSimulationStore } from "@/stores/simulation-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";

export function ImpactPathViewer() {
  const { selectedImpactedService } = useSimulationStore();

  if (!selectedImpactedService) {
    return (
      <EmptyState
        title="Select an impacted service"
        description="Inspect the dependency paths that caused the failure cascade."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Paths to {selectedImpactedService.serviceName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedImpactedService.paths.map((path, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          >
            {path.join(" → ")}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
