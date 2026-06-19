"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useHealthSummary } from "@/hooks/use-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/states";
import { StatsCardSkeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/lib/utils";

const COLORS = ["#34d399", "#fbbf24", "#fb7185"];

export function HealthOverview() {
  const { data, isLoading, isError, error, refetch } = useHealthSummary();

  if (isLoading) return <StatsCardSkeleton />;
  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? "Failed to load health summary"}
        onRetry={() => refetch()}
      />
    );
  }

  const summary = data ?? { total: 0, healthy: 0, degraded: 0, failed: 0 };
  const chartData = [
    { name: "Healthy", value: summary.healthy },
    { name: "Degraded", value: summary.degraded },
    { name: "Failed", value: summary.failed },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Health</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Total services" value={summary.total} />
          <Metric
            label="Healthy"
            value={summary.healthy}
            hint={formatPercent(summary.healthy, summary.total)}
            color="text-emerald-400"
          />
          <Metric
            label="Degraded"
            value={summary.degraded}
            hint={formatPercent(summary.degraded, summary.total)}
            color="text-amber-400"
          />
          <Metric
            label="Failed"
            value={summary.failed}
            hint={formatPercent(summary.failed, summary.total)}
            color="text-rose-400"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  hint,
  color = "text-slate-900",
}: {
  label: string;
  value: number;
  hint?: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
