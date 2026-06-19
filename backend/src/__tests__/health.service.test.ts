import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from "../lib/prisma";
import { healthService } from "../services/health.service";

describe("healthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok when database is connected", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);

    const result = await healthService.ping();

    expect(result.status).toBe("ok");
    expect(result.database).toBe("connected");
    expect(result.uptime).toBeGreaterThan(0);
  });

  it("returns degraded when database is disconnected", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("connection refused"));

    const result = await healthService.ping();

    expect(result.status).toBe("degraded");
    expect(result.database).toBe("disconnected");
  });
});
