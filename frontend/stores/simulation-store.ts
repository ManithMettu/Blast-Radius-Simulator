import type { ImpactedService, SimulationResult } from "@/types";
import { create } from "zustand";

interface SimulationState {
  selectedServiceIds: string[];
  activeResult: SimulationResult | null;
  liveImpacted: ImpactedService[];
  highlightedPaths: string[][];
  selectedImpactedService: ImpactedService | null;
  isSimulating: boolean;
  toggleService: (id: string) => void;
  setSelectedServices: (ids: string[]) => void;
  clearSelection: () => void;
  setActiveResult: (result: SimulationResult | null) => void;
  addLiveImpact: (impact: ImpactedService) => void;
  resetSimulationProgress: () => void;
  setHighlightedPaths: (paths: string[][]) => void;
  selectImpactedService: (service: ImpactedService | null) => void;
  setIsSimulating: (value: boolean) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  selectedServiceIds: [],
  activeResult: null,
  liveImpacted: [],
  highlightedPaths: [],
  selectedImpactedService: null,
  isSimulating: false,

  toggleService: (id) =>
    set((state) => ({
      selectedServiceIds: state.selectedServiceIds.includes(id)
        ? state.selectedServiceIds.filter((s) => s !== id)
        : [...state.selectedServiceIds, id],
    })),

  setSelectedServices: (ids) => set({ selectedServiceIds: ids }),

  clearSelection: () => set({ selectedServiceIds: [] }),

  setActiveResult: (result) =>
    set({
      activeResult: result,
      liveImpacted: result?.impacted ?? [],
    }),

  addLiveImpact: (impact) =>
    set((state) => {
      const exists = state.liveImpacted.some(
        (item) => item.serviceId === impact.serviceId,
      );
      const liveImpacted = exists
        ? state.liveImpacted
        : [...state.liveImpacted, impact];

      return {
        liveImpacted,
        activeResult: {
          impacted: liveImpacted,
          directlyImpacted: liveImpacted
            .filter((item) => item.direct)
            .map((item) => item.serviceId),
          indirectlyImpacted: liveImpacted
            .filter((item) => !item.direct)
            .map((item) => item.serviceId),
          blastRadius: liveImpacted.length,
        },
      };
    }),

  resetSimulationProgress: () =>
    set({ liveImpacted: [], activeResult: null, selectedImpactedService: null }),

  setHighlightedPaths: (paths) => set({ highlightedPaths: paths }),

  selectImpactedService: (service) =>
    set({
      selectedImpactedService: service,
      highlightedPaths: service?.paths ?? [],
    }),

  setIsSimulating: (value) => set({ isSimulating: value }),

  reset: () =>
    set({
      selectedServiceIds: [],
      activeResult: null,
      liveImpacted: [],
      highlightedPaths: [],
      selectedImpactedService: null,
      isSimulating: false,
    }),
}));
