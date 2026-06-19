import { PageHeader } from "@/components/ui/states";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { HealthOverview } from "@/components/dashboard/health-overview";
import { DependencyGraph } from "@/components/graph/dependency-graph";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of service health, topology, and system resilience."
      />
      <StatsCards />
      <HealthOverview />
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">System topology</h2>
        <DependencyGraph />
      </div>
    </div>
  );
}
