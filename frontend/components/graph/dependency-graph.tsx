"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MiniMap,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { useGraph } from "@/hooks/use-graph";
import { useSimulationStore } from "@/stores/simulation-store";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { GraphSkeleton } from "@/components/ui/skeleton";
import { layoutGraph } from "@/lib/graph-layout";
import type { GraphNode } from "@/types";

type ServiceNodeData = GraphNode & { impacted?: boolean; failed?: boolean };

function statusDot(status: ServiceNodeData["status"]) {
  switch (status) {
    case "HEALTHY":
      return "bg-emerald-500";
    case "DEGRADED":
      return "bg-amber-500";
    case "FAILED":
      return "bg-rose-500";
  }
}

function criticalityDot(criticality: ServiceNodeData["criticality"]) {
  switch (criticality) {
    case "LOW":
      return "bg-slate-400";
    case "MEDIUM":
      return "bg-sky-500";
    case "HIGH":
      return "bg-orange-500";
    case "CRITICAL":
      return "bg-rose-600";
  }
}

function ServiceNode({ data }: { data: ServiceNodeData }) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-sky-500"
      />
      <div
        className={`w-[172px] rounded-lg border-2 px-3 py-2 shadow-sm transition-shadow ${
          data.failed
            ? "border-rose-500 bg-rose-50 shadow-rose-100"
            : data.impacted
              ? "border-amber-400 bg-amber-50 shadow-amber-100"
              : "border-slate-300 bg-white hover:shadow-md"
        }`}
      >
        <p className="truncate text-center text-xs font-semibold text-slate-900">
          {data.label}
        </p>
        <div className="mt-1.5 flex justify-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${statusDot(data.status)}`}
            title={`Status: ${data.status}`}
          />
          <span
            className={`h-2 w-2 rounded-full ${criticalityDot(data.criticality)}`}
            title={`Criticality: ${data.criticality}`}
          />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-sky-500"
      />
    </>
  );
}

const nodeTypes = { service: ServiceNode };

export function DependencyGraph() {
  const { data, isLoading, isError, error, refetch } = useGraph();
  const { activeResult, selectedServiceIds, highlightedPaths } = useSimulationStore();

  const impactedIds = useMemo(
    () => new Set(activeResult?.impacted.map((item) => item.serviceId) ?? []),
    [activeResult],
  );

  const highlightedEdgeIds = useMemo(() => {
    const ids = new Set<string>();
    const nameToId = new Map((data?.nodes ?? []).map((n) => [n.label, n.id]));

    highlightedPaths.forEach((path) => {
      for (let i = 0; i < path.length - 1; i++) {
        const from = nameToId.get(path[i]);
        const to = nameToId.get(path[i + 1]);
        if (from && to) ids.add(`${from}-${to}`);
      }
    });
    return ids;
  }, [highlightedPaths, data?.nodes]);

  const { nodes, edges } = useMemo(() => {
    if (!data?.nodes.length) return { nodes: [], edges: [] };

    const baseNodes: Node[] = data.nodes.map((node) => ({
      id: node.id,
      type: "service",
      position: { x: 0, y: 0 },
      data: {
        ...node,
        impacted: impactedIds.has(node.id),
        failed: selectedServiceIds.includes(node.id),
      },
    }));

    const baseEdges: Edge[] = data.edges.map((edge) => {
      const isHighlighted = highlightedEdgeIds.has(edge.id);
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? "#0284c7" : "#94a3b8",
          strokeWidth: isHighlighted ? 2.5 : 1.75,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: isHighlighted ? "#0284c7" : "#64748b",
        },
      };
    });

    return {
      nodes: layoutGraph(baseNodes, baseEdges, "TB"),
      edges: baseEdges,
    };
  }, [data, impactedIds, selectedServiceIds, highlightedEdgeIds]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    window.requestAnimationFrame(() => {
      instance.fitView({ padding: 0.15, maxZoom: 1.2 });
    });
  }, []);

  if (isLoading) return <GraphSkeleton />;
  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? "Failed to load graph"}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data?.nodes.length) {
    return (
      <EmptyState
        title="Graph is empty"
        description="Add services and dependencies to visualize your system topology."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="h-[480px] sm:h-[640px]">
        <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        defaultEdgeOptions={{ type: "smoothstep" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={16} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          className="!rounded-lg !border !border-slate-200 !bg-white"
          nodeColor={(node) =>
            node.data?.failed
              ? "#f43f5e"
              : node.data?.impacted
                ? "#f59e0b"
                : "#94a3b8"
          }
          maskColor="rgb(248 250 252 / 0.7)"
        />
      </ReactFlow>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-500">
        <span className="font-medium text-slate-700">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-6 border-t-2 border-slate-400" />
          Dependency flow
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Degraded
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" /> Failed / Critical
        </span>
        <span className="text-slate-400">Arrows point to upstream dependencies</span>
      </div>
    </div>
  );
}
