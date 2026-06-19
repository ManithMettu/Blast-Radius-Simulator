"use client";

import { useSimulationStream } from "@/hooks/use-simulation-stream";
import { PageHeader } from "@/components/ui/states";
import { SimulationPanel } from "@/components/simulations/simulation-panel";
import { BlastRadiusResult } from "@/components/simulations/blast-radius-result";
import { ImpactPathViewer } from "@/components/simulations/impact-path-viewer";
import { DependencyGraph } from "@/components/graph/dependency-graph";

export default function SimulationsPage() {
  useSimulationStream(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulations"
        description="Simulate service failures and analyze real-time blast radius impact."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <SimulationPanel />
        <DependencyGraph />
      </div>

      <BlastRadiusResult />
      <ImpactPathViewer />
    </div>
  );
}
