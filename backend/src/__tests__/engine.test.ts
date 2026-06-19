import { describe, expect, it } from "vitest";
import { Graph } from "graphlib";
import { computeBlastRadius } from "../engine/blast-radius";
import { detectCycle } from "../engine/cycle-detection";
import { buildGraph } from "../engine/graph-builder";

describe("cycle detection", () => {
  it("detects self-dependency", () => {
    const graph = new Graph({ directed: true });
    graph.setNode("a", { id: "a", name: "a", criticality: "MEDIUM" });
    const result = detectCycle(graph, "a", "a");
    expect(result.hasCycle).toBe(true);
  });

  it("detects circular dependency", () => {
    const graph = buildGraph(
      [
        { id: "a", name: "a", criticality: "MEDIUM" },
        { id: "b", name: "b", criticality: "MEDIUM" },
        { id: "c", name: "c", criticality: "MEDIUM" },
      ],
      [
        { dependentId: "a", dependencyId: "b" },
        { dependentId: "b", dependencyId: "c" },
      ],
    );

    const result = detectCycle(graph, "c", "a");
    expect(result.hasCycle).toBe(true);
    expect(result.cycle).toBeDefined();
  });
});

describe("blast radius", () => {
  it("computes impacted services from failure", () => {
    const graph = buildGraph(
      [
        { id: "gateway", name: "gateway", criticality: "CRITICAL" },
        { id: "auth", name: "auth", criticality: "HIGH" },
        { id: "orders", name: "orders", criticality: "HIGH" },
        { id: "payments", name: "payments", criticality: "CRITICAL" },
      ],
      [
        { dependentId: "gateway", dependencyId: "auth" },
        { dependentId: "gateway", dependencyId: "orders" },
        { dependentId: "orders", dependencyId: "payments" },
      ],
    );

    const result = computeBlastRadius(graph, ["payments"]);

    expect(result.blastRadius).toBe(2);
    expect(result.directlyImpacted).toContain("orders");
    expect(result.indirectlyImpacted).toContain("gateway");
  });
});
