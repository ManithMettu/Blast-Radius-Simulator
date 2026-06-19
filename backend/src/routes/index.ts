import { Router } from "express";
import type { Controllers } from "../controllers";
import { asyncHandler, validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  createDependencySchema,
  createServiceSchema,
  detectCycleSchema,
  idParamSchema,
  runSimulationSchema,
  serviceFiltersSchema,
  serviceIdParamSchema,
  simulationFiltersSchema,
  updateServiceSchema,
} from "../validators/schemas";

export function createRoutes(controllers: Controllers) {
  const router = Router();

  // Health
  router.get("/health", asyncHandler(controllers.health.ping));
  router.get("/health/summary", asyncHandler(controllers.health.summary));

  // Services
  router.get(
    "/services",
    validateQuery(serviceFiltersSchema),
    asyncHandler(controllers.services.list),
  );
  router.get(
    "/services/:id",
    validateParams(idParamSchema),
    asyncHandler(controllers.services.getById),
  );
  router.post(
    "/services",
    validateBody(createServiceSchema),
    asyncHandler(controllers.services.create),
  );
  router.patch(
    "/services/:id",
    validateParams(idParamSchema),
    validateBody(updateServiceSchema),
    asyncHandler(controllers.services.update),
  );
  router.delete(
    "/services/:id",
    validateParams(idParamSchema),
    asyncHandler(controllers.services.remove),
  );

  // Dependencies
  router.get("/dependencies", asyncHandler(controllers.dependencies.list));
  router.get(
    "/dependencies/service/:serviceId",
    validateParams(serviceIdParamSchema),
    asyncHandler(controllers.dependencies.listByService),
  );
  router.post(
    "/dependencies",
    validateBody(createDependencySchema),
    asyncHandler(controllers.dependencies.create),
  );
  router.delete(
    "/dependencies/:id",
    validateParams(idParamSchema),
    asyncHandler(controllers.dependencies.remove),
  );
  router.post(
    "/dependencies/detect-cycle",
    validateBody(detectCycleSchema),
    asyncHandler(controllers.dependencies.detectCycle),
  );

  // Graph
  router.get("/graph", asyncHandler(controllers.graph.get));

  // Simulations
  router.get(
    "/simulations",
    validateQuery(simulationFiltersSchema),
    asyncHandler(controllers.simulations.list),
  );
  router.get(
    "/simulations/:id",
    validateParams(idParamSchema),
    asyncHandler(controllers.simulations.getById),
  );
  router.post(
    "/simulations/run",
    validateBody(runSimulationSchema),
    asyncHandler(controllers.simulations.run),
  );

  return router;
}
