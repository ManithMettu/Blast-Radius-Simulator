import { PageHeader } from "@/components/ui/states";
import { DependencyManager } from "@/components/dependencies/dependency-manager";

export default function DependenciesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dependencies"
        description="Define service relationships and detect circular dependencies."
      />
      <DependencyManager />
    </div>
  );
}
