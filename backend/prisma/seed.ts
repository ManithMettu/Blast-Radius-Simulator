import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const services = [
    {
      name: "api-gateway",
      description: "Public API entry point",
      owner: "platform-team",
      criticality: "CRITICAL" as const,
      status: "HEALTHY" as const,
    },
    {
      name: "auth-service",
      description: "Authentication and authorization",
      owner: "security-team",
      criticality: "CRITICAL" as const,
      status: "HEALTHY" as const,
    },
    {
      name: "user-service",
      description: "User profile management",
      owner: "identity-team",
      criticality: "HIGH" as const,
      status: "HEALTHY" as const,
    },
    {
      name: "order-service",
      description: "Order processing",
      owner: "commerce-team",
      criticality: "HIGH" as const,
      status: "HEALTHY" as const,
    },
    {
      name: "payment-service",
      description: "Payment processing",
      owner: "payments-team",
      criticality: "CRITICAL" as const,
      status: "HEALTHY" as const,
    },
    {
      name: "inventory-service",
      description: "Stock and inventory tracking",
      owner: "commerce-team",
      criticality: "MEDIUM" as const,
      status: "HEALTHY" as const,
    },
    {
      name: "notification-service",
      description: "Email and push notifications",
      owner: "platform-team",
      criticality: "LOW" as const,
      status: "HEALTHY" as const,
    },
    {
      name: "analytics-service",
      description: "Event tracking and analytics",
      owner: "data-team",
      criticality: "LOW" as const,
      status: "DEGRADED" as const,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    });
  }

  const serviceMap = Object.fromEntries(
    (await prisma.service.findMany()).map((s) => [s.name, s.id]),
  );

  const dependencies = [
    ["api-gateway", "auth-service"],
    ["api-gateway", "user-service"],
    ["api-gateway", "order-service"],
    ["user-service", "auth-service"],
    ["order-service", "user-service"],
    ["order-service", "payment-service"],
    ["order-service", "inventory-service"],
    ["payment-service", "auth-service"],
    ["notification-service", "user-service"],
    ["analytics-service", "order-service"],
    ["analytics-service", "user-service"],
  ] as const;

  for (const [dependent, dependency] of dependencies) {
    const dependentId = serviceMap[dependent];
    const dependencyId = serviceMap[dependency];

    if (!dependentId || !dependencyId) continue;

    await prisma.dependency.upsert({
      where: {
        dependentId_dependencyId: { dependentId, dependencyId },
      },
      update: {},
      create: { dependentId, dependencyId },
    });
  }

  console.log(`Seeded ${services.length} services and ${dependencies.length} dependencies`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
