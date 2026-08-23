import { describe, it, expect } from "vitest";
import { generateCraneGeometry } from "./craneGeometry";
import { Geometry, Node, Member, CraneConfig } from "./types";

describe("Crane Geometry Generation", () => {
  it("generates no crane geometry if craneEnabled is false", () => {
    const config: CraneConfig = {
      craneEnabled: false,
    };
    const nodes: Node[] = [];
    const members: Member[] = [];
    
    generateCraneGeometry(config, { projectId: "proj-1" } as Geometry, nodes, members);
    
    expect(nodes.length).toBe(0);
    expect(members.length).toBe(0);
  });

  it("generates deterministic runway nodes and members", () => {
    const config: CraneConfig = {
      craneEnabled: true,
      craneId: "CR-01",
      runwayElevation_m: 6,
    };
    
    const geom = { projectId: "proj-1" } as Geometry;
    const nodes: Node[] = [
      { id: "n1", projectId: "proj-1", label: "N1", x_m: 0, y_m: 0, z_m: 0, role: "SUPPORT" },
      { id: "n2", projectId: "proj-1", label: "N2", x_m: 0, y_m: 0, z_m: 20, role: "SUPPORT" },
      { id: "n3", projectId: "proj-1", label: "N3", x_m: 6, y_m: 0, z_m: 0, role: "SUPPORT" },
      { id: "n4", projectId: "proj-1", label: "N4", x_m: 6, y_m: 0, z_m: 20, role: "SUPPORT" },
    ];
    
    const members: Member[] = [
      { id: "m1", projectId: "proj-1", label: "C1", type: "COLUMN", startNodeId: "n1", endNodeId: "n_top1", length_m: 8, quantity: 1, weightStatus: "NOT_IMPLEMENTED" },
      { id: "m2", projectId: "proj-1", label: "C2", type: "COLUMN", startNodeId: "n2", endNodeId: "n_top2", length_m: 8, quantity: 1, weightStatus: "NOT_IMPLEMENTED" },
      { id: "m3", projectId: "proj-1", label: "C3", type: "COLUMN", startNodeId: "n3", endNodeId: "n_top3", length_m: 8, quantity: 1, weightStatus: "NOT_IMPLEMENTED" },
      { id: "m4", projectId: "proj-1", label: "C4", type: "COLUMN", startNodeId: "n4", endNodeId: "n_top4", length_m: 8, quantity: 1, weightStatus: "NOT_IMPLEMENTED" },
    ];
    
    generateCraneGeometry(config, geom, nodes, members);
    
    const craneNodes = nodes.filter(n => n.role === "CRANE_SUPPORT");
    const craneMembers = members.filter(m => m.type === "CRANE_RUNWAY");
    
    expect(craneNodes.length).toBe(4); // 2 grids (0, 6) x 2 sides (0, 20)
    expect(craneMembers.length).toBe(2); // 1 bay x 2 sides
    
    // Provenance check
    expect((craneNodes[0].metadata as any).generatedBy).toBe("CRANE_SYSTEM");
    expect((craneMembers[0].metadata as any).craneId).toBe("CR-01");
  });
});
