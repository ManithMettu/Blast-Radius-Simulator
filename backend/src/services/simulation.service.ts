import {
  calculateOverallSeverity,
  computeBlastRadiusAsync,
} from "../engine/blast-radius";
import { simulationRepository } from "../repositories/simulation.repository";
import { serviceRepository } from "../repositories/service.repository";
import { AppError } from "../types";
import type { ImpactedService, SimulationResult } from "../types";
import { graphService } from "./graph.service";
import type { Server as SocketServer } from "socket.io";
import type { z } from "zod";
import type { runSimulationSchema } from "../validators/schemas";

type RunInput = z.infer<typeof runSimulationSchema>;

export const simulationService = {
  async list(filters?: {
    search?: string;
    minSeverity?: number;
    minImpacted?: number;
    page?: number;
    pageSize?: number;
  }) {
    return simulationRepository.findAll(filters);
  },

  async getById(id: string) {
    const simulation = await simulationRepository.findById(id);
    if (!simulation) {
      throw new AppError(404, "Simulation not found", "SIMULATION_NOT_FOUND");
    }
    return simulation;
  },

  async run(input: RunInput, io?: SocketServer) {
    for (const id of input.failedServiceIds) {
      const service = await serviceRepository.findById(id);
      if (!service) {
        throw new AppError(
          404,
          `Service ${id} not found`,
          "SERVICE_NOT_FOUND",
        );
      }
    }

    const graph = await graphService.getEngineGraph();
    io?.emit("simulation:start");

    let result: SimulationResult;

    try {
      result = await computeBlastRadiusAsync(
        graph,
        input.failedServiceIds,
        {
          onImpact: async (impact: ImpactedService) => {
            io?.emit("simulation:progress", {
              type: "progress",
              impacted: impact,
            });
          },
        },
      );
    } catch (error) {
      io?.emit("simulation:error", {
        message: error instanceof Error ? error.message : "Simulation failed",
      });
      throw error;
    }

    const severityScore = calculateOverallSeverity(result.impacted);

    const simulation = await simulationRepository.create({
      name: input.name,
      failedServiceIds: input.failedServiceIds,
      totalImpacted: result.blastRadius,
      severityScore,
      results: result,
    });

    io?.emit("simulation:complete", result);

    return simulation;
  },
};
