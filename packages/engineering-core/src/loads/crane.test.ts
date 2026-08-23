import { describe, it, expect } from "vitest";
import { generateCraneLoads } from "./crane";
import { CraneConfig, Geometry, Node, Member, LoadCase } from "../types";
import { createId } from "../ids";

describe("Crane Loads Generation", () => {
  it("generates no loads if craneEnabled is false", () => {
    const config: CraneConfig = { craneEnabled: false };
    const loadCases = generateCraneLoads(config, {} as Geometry, [], [], []);
    expect(loadCases.length).toBe(0);
  });

  it("yields REQUIRES_ENGINEERING_REVIEW for missing force methodologies", () => {
    const config: CraneConfig = {
      craneEnabled: true,
      craneId: "CR-01",
      capacity_t: 10,
      craneSelfWeight_kN: 40,
      trolleyWeight_kN: 5,
      craneSpan_m: 20,
      numberOfWheels: 4,
      // intentionally missing methodologies
    };
    
    const geom = { projectId: "proj-1" } as Geometry;
    const nodes: Node[] = [
      { id: "n1", projectId: "proj-1", label: "N1", x_m: 0, y_m: 5, z_m: 0, role: "CRANE_SUPPORT", metadata: { craneId: "CR-01" } }
    ];
    
    const loadCases = generateCraneLoads(config, geom, nodes, [], []);
    expect(loadCases.length).toBe(1);
    expect(loadCases[0].status).toBe("REQUIRES_ENGINEERING_REVIEW");
    expect(loadCases[0].applications.length).toBe(1); // vertical static assumption
  });

  it("does not hardcode 20% or 10% percentages, uses provided verified methodologies", () => {
    const config: CraneConfig = {
      craneEnabled: true,
      craneId: "CR-01",
      capacity_t: 10,
      craneSelfWeight_kN: 40,
      trolleyWeight_kN: 5,
      craneSpan_m: 20,
      numberOfWheels: 4,
      verticalImpactMethodology: { value: 0.25, source: "Client Specs", standard: "IS 875", edition: "2015", verified: true },
      transverseMethodology: { value: 0.15, source: "Client Specs", standard: "IS 875", edition: "2015", verified: true },
      longitudinalMethodology: { value: 0.07, source: "Client Specs", standard: "IS 875", edition: "2015", verified: true },
    };
    
    const geom = { projectId: "proj-1" } as Geometry;
    const nodes: Node[] = [
      { id: "n1", projectId: "proj-1", label: "N1", x_m: 0, y_m: 5, z_m: 0, role: "CRANE_SUPPORT", metadata: { craneId: "CR-01" } }
    ];
    
    const loadCases = generateCraneLoads(config, geom, nodes, [], []);
    
    expect(loadCases.length).toBe(1);
    // Since wheel distribution info is missing, the overall status is still REQUIRES_ENGINEERING_REVIEW by our logic (hasWheelDistributionInfo = false)
    expect(loadCases[0].status).toBe("REQUIRES_ENGINEERING_REVIEW"); 
    
    const apps = loadCases[0].applications;
    expect(apps.length).toBe(3); // Vertical, Transverse, Longitudinal
    
    const trans = apps.find(a => a.direction === "GX");
    // total trans = (10*9.81 + 5) * 0.15 = 103.1 * 0.15 = 15.465
    // per wheel = 15.465 / 4 = 3.86625
    expect(trans?.magnitude).toBeCloseTo(3.86625, 3);
    
    // Check provenance
    expect((trans?.metadata as any).generatedBy).toBe("CRANE_SYSTEM");
  });
});
