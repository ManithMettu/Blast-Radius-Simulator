import { PageHeader } from "@/components/ui/states";
import { DependencyGraph } from "@/components/graph/dependency-graph";

export default function GraphPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dependency Graph"
        description="Interactive visualization of services and their dependency chains."
      />
      <DependencyGraph />
    </div>
  );
}
