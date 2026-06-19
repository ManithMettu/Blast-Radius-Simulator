"use client";

import { useHealthSummary } from "@/hooks/use-health";
import { useServices } from "@/hooks/use-services";
import { useSimulations } from "@/hooks/use-simulations";
import { useDependencies } from "@/hooks/use-dependencies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCardSkeleton } from "@/components/ui/skeleton";
import { Network, Server, Zap, GitBranch } from "lucide-react";

export function StatsCards() {
  const health = useHealthSummary();
  const services = useServices({ pageSize: 1 });
  const dependencies = useDependencies();
  const simulations = useSimulations({ pageSize: 1 });

  if (health.isLoading || services.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Services",
      value: health.data?.total ?? services.data?.total ?? 0,
      icon: Server,
      color: "text-sky-400",
    },
    {
      label: "Dependencies",
      value: dependencies.data?.length ?? 0,
      icon: GitBranch,
      color: "text-violet-400",
    },
    {
      label: "Simulations",
      value: simulations.data?.total ?? 0,
      icon: Zap,
      color: "text-amber-400",
    },
    {
      label: "Graph nodes",
      value: health.data?.total ?? 0,
      icon: Network,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
