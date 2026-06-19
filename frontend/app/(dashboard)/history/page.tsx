import { PageHeader } from "@/components/ui/states";
import { SimulationHistoryTable } from "@/components/simulations/simulation-history-table";
import { BlastRadiusResult } from "@/components/simulations/blast-radius-result";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulation History"
        description="Revisit, compare, and analyze previous failure simulations."
      />
      <SimulationHistoryTable />
      <BlastRadiusResult />
    </div>
  );
}
