"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useSimulationStore } from "@/stores/simulation-store";
import type { ImpactedService, SimulationResult } from "@/types";

interface SimulationProgressEvent {
  type: "progress";
  impacted: ImpactedService;
}

export function useSimulationStream(enabled = false) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const {
    setActiveResult,
    setIsSimulating,
    addLiveImpact,
    resetSimulationProgress,
  } = useSimulationStore();

  useEffect(() => {
    if (!enabled) return;

    const socket = io(getApiBaseUrl(), {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("simulation:start", () => {
      resetSimulationProgress();
      setIsSimulating(true);
      toast.info("Simulation started");
    });

    socket.on("simulation:progress", (event: SimulationProgressEvent) => {
      if (event.type === "progress" && event.impacted) {
        addLiveImpact(event.impacted);
      }
    });

    socket.on("simulation:complete", (result: SimulationResult) => {
      setActiveResult(result);
      setIsSimulating(false);
      toast.success(`Blast radius: ${result.blastRadius} services impacted`);
      queryClient.invalidateQueries({ queryKey: queryKeys.simulations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.health.all });
    });

    socket.on("simulation:error", (payload: { message?: string }) => {
      setIsSimulating(false);
      toast.error(payload?.message ?? "Simulation failed");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    enabled,
    queryClient,
    setActiveResult,
    setIsSimulating,
    addLiveImpact,
    resetSimulationProgress,
  ]);

  return socketRef;
}
