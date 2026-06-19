import { prisma } from "../lib/prisma";
import { serviceRepository } from "../repositories/service.repository";

export const healthService = {
  async ping() {
    const started = Date.now();
    let database: "connected" | "disconnected" = "disconnected";

    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "connected";
    } catch {
      database = "disconnected";
    }

    return {
      status: database === "connected" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database,
      latencyMs: Date.now() - started,
    };
  },

  async getSummary() {
    return serviceRepository.countByStatus();
  },
};
