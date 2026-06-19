"use client";

import { useSimulationStore } from "@/stores/simulation-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { severityColor } from "@/lib/utils";

export function BlastRadiusResult() {
  const {
    activeResult,
    isSimulating,
    selectImpactedService,
    selectedImpactedService,
  } = useSimulationStore();

  if (!activeResult) {
    return (
      <EmptyState
        title="No simulation results"
        description="Run a failure simulation to see blast radius analysis."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Blast radius</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Metric label="Total impacted" value={activeResult.blastRadius} />
          <Metric
            label="Direct impact"
            value={activeResult.directlyImpacted.length}
          />
          <Metric
            label="Indirect impact"
            value={activeResult.indirectlyImpacted.length}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Impacted services
            {isSimulating ? (
                <span className="ml-2 text-sm font-normal text-amber-600">
                Updating live...
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeResult.impacted.map((item) => (
            <button
              key={item.serviceId}
              type="button"
              onClick={() => selectImpactedService(item)}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                selectedImpactedService?.serviceId === item.serviceId
                  ? "border-sky-300 bg-sky-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div>
                <p className="font-medium text-slate-900">{item.serviceName}</p>
                <p className="text-xs text-slate-500">
                  Depth {item.depth} · {item.direct ? "Direct" : "Indirect"}
                </p>
              </div>
              <span className={`text-sm font-semibold ${severityColor(item.severity)}`}>
                {item.severity}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
