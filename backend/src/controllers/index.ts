import type { Request, Response } from "express";
import { dependencyService } from "../services/dependency.service";
import { graphService } from "../services/graph.service";
import { healthService } from "../services/health.service";
import { serviceService } from "../services/service.service";
import { simulationService } from "../services/simulation.service";
import type { Server as SocketServer } from "socket.io";
import type { serviceFiltersSchema, simulationFiltersSchema } from "../validators/schemas";
import type { z } from "zod";

type ServiceFilters = z.infer<typeof serviceFiltersSchema>;
type SimulationFilters = z.infer<typeof simulationFiltersSchema>;

export function createControllers(io?: SocketServer) {
  return {
    health: {
      async summary(_req: Request, res: Response) {
        const summary = await healthService.getSummary();
        res.json(summary);
      },

      async ping(_req: Request, res: Response) {
        const health = await healthService.ping();
        const statusCode = health.database === "connected" ? 200 : 503;
        res.status(statusCode).json(health);
      },
    },

    services: {
      async list(req: Request, res: Response) {
        const filters = req.validatedQuery as ServiceFilters | undefined;
        const services = await serviceService.list(filters);
        res.json(services);
      },

      async getById(req: Request, res: Response) {
        const { id } = req.validatedParams as { id: string };
        const service = await serviceService.getById(id);
        res.json(service);
      },

      async create(req: Request, res: Response) {
        const service = await serviceService.create(req.validatedBody as never);
        res.status(201).json(service);
      },

      async update(req: Request, res: Response) {
        const { id } = req.validatedParams as { id: string };
        const service = await serviceService.update(id, req.validatedBody as never);
        res.json(service);
      },

      async remove(req: Request, res: Response) {
        const { id } = req.validatedParams as { id: string };
        await serviceService.remove(id);
        res.status(204).send();
      },
    },

    dependencies: {
      async list(_req: Request, res: Response) {
        const deps = await dependencyService.list();
        res.json(deps);
      },

      async listByService(req: Request, res: Response) {
        const { serviceId } = req.validatedParams as { serviceId: string };
        const deps = await dependencyService.listByService(serviceId);
        res.json(deps);
      },

      async create(req: Request, res: Response) {
        const dep = await dependencyService.create(req.validatedBody as never);
        res.status(201).json(dep);
      },

      async remove(req: Request, res: Response) {
        const { id } = req.validatedParams as { id: string };
        await dependencyService.remove(id);
        res.status(204).send();
      },

      async detectCycle(req: Request, res: Response) {
        const { dependentId, dependencyId } = req.validatedBody as {
          dependentId: string;
          dependencyId: string;
        };
        const result = await dependencyService.checkCycle(dependentId, dependencyId);
        res.json(result);
      },
    },

    graph: {
      async get(_req: Request, res: Response) {
        const graph = await graphService.getGraphData();
        res.json(graph);
      },
    },

    simulations: {
      async list(req: Request, res: Response) {
        const filters = req.validatedQuery as SimulationFilters | undefined;
        const simulations = await simulationService.list(filters);
        res.json(simulations);
      },

      async getById(req: Request, res: Response) {
        const { id } = req.validatedParams as { id: string };
        const simulation = await simulationService.getById(id);
        res.json(simulation);
      },

      async run(req: Request, res: Response) {
        const simulation = await simulationService.run(req.validatedBody as never, io);
        res.status(201).json(simulation);
      },
    },
  };
}

export type Controllers = ReturnType<typeof createControllers>;
