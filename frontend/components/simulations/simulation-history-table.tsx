"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useSimulations } from "@/hooks/use-simulations";
import { useSimulationStore } from "@/stores/simulation-store";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { formatDate, severityColor } from "@/lib/utils";
import type { Simulation, SimulationFilters } from "@/types";

const columnHelper = createColumnHelper<Simulation>();

export function SimulationHistoryTable() {
  const [filters, setFilters] = useState<SimulationFilters>({
    search: "",
    minSeverity: undefined,
    minImpacted: undefined,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const { data: page, isLoading, isError, error, refetch } = useSimulations(filters);
  const { setActiveResult } = useSimulationStore();
  const simulations = page?.data ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Simulation",
        cell: (info) => info.getValue() ?? "Untitled simulation",
      }),
      columnHelper.accessor("failedServiceIds", {
        header: "Failed services",
        cell: (info) => info.getValue().length,
      }),
      columnHelper.accessor("totalImpacted", {
        header: "Impacted",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("severityScore", {
        header: "Severity",
        cell: (info) => (
          <span className={severityColor(info.getValue())}>
            {info.getValue().toFixed(1)}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Run at",
        cell: (info) => formatDate(info.getValue()),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: simulations,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <TableSkeleton rows={5} />;
  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? "Failed to load simulations"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Input
          placeholder="Search simulations..."
          value={filters.search ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
        />
        <Input
          type="number"
          min={0}
          max={100}
          placeholder="Min severity"
          value={filters.minSeverity ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              minSeverity: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
        <Input
          type="number"
          min={0}
          placeholder="Min impacted"
          value={filters.minImpacted ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              minImpacted: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
      </div>

      {!simulations.length ? (
        <EmptyState
          title="No simulation history"
          description="Past simulations will appear here for comparison and analysis."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setActiveResult(row.original.results)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {page ? (
            <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
              Showing {simulations.length} of {page.total} simulations
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
