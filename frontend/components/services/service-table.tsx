"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useServices, useDeleteService } from "@/hooks/use-services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { TableSkeleton } from "@/components/ui/skeleton";
import { CRITICALITY_LEVELS, SERVICE_STATUSES } from "@/lib/constants";
import {
  CRITICALITY_LABELS,
  STATUS_LABELS,
  criticalityColor,
  statusColor,
} from "@/lib/utils";
import type { Criticality, Service, ServiceFilters, ServiceStatus } from "@/types";

const columnHelper = createColumnHelper<Service>();

interface ServiceTableProps {
  onEdit: (service: Service) => void;
}

export function ServiceTable({ onEdit }: ServiceTableProps) {
  const [filters, setFilters] = useState<ServiceFilters>({
    search: "",
    status: "ALL",
    criticality: "ALL",
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: page, isLoading, isError, error, refetch } = useServices(filters);
  const deleteService = useDeleteService();
  const services = page?.data ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Service",
        cell: (info) => (
          <div>
            <p className="font-medium text-slate-900">{info.getValue()}</p>
            <p className="text-xs text-slate-500">{info.row.original.owner ?? "No owner"}</p>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge className={statusColor(info.getValue())}>
            {STATUS_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.accessor("criticality", {
        header: "Criticality",
        cell: (info) => (
          <Badge className={criticalityColor(info.getValue())}>
            {CRITICALITY_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.accessor("dependencyCount", {
        header: "Dependencies",
        cell: (info) => info.getValue() ?? 0,
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteService.mutate(row.original.id)}
            >
              <Trash2 className="h-4 w-4 text-rose-400" />
            </Button>
          </div>
        ),
      }),
    ],
    [deleteService, onEdit],
  );

  const table = useReactTable({
    data: services,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return <TableSkeleton rows={6} />;
  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? "Failed to load services. Is the backend running?"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Input
          placeholder="Search services..."
          value={filters.search ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
        />
        <Select
          value={filters.status ?? "ALL"}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              status: e.target.value as ServiceStatus | "ALL",
            }))
          }
        >
          <option value="ALL">All statuses</option>
          {SERVICE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <Select
          value={filters.criticality ?? "ALL"}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              criticality: e.target.value as Criticality | "ALL",
            }))
          }
        >
          <option value="ALL">All criticality</option>
          {CRITICALITY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {CRITICALITY_LABELS[level]}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Filter by owner"
          value={filters.owner ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, owner: e.target.value }))
          }
        />
      </div>

      {!services.length ? (
        <EmptyState
          title="No services yet"
          description="Create your first service to start modeling your distributed system."
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
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
              Showing {services.length} of {page.total} services
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
