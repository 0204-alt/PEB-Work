import { describe, it, expect } from "vitest";
import { calculateSecondaryDemand, designSecondaryMember } from "./secondary.js";
import { Member, LoadCase, Section, Material, DesignDemand } from "../types.js";

describe("secondary steel design engine", () => {
  it("should calculate correct line loads and demands for secondary members", () => {
    const member: Member = {
      id: "m-1",
      projectId: "p-1",
      startNodeId: "n-1",
      endNodeId: "n-2",
      label: "M-PURLIN-1",
      type: "PURLIN",
      length_m: 6.0, // 6m span
      quantity: 1,
      weightStatus: "NOT_IMPLEMENTED",
      designGroup: ""
    };

    const loadCases: LoadCase[] = [
      {
        id: "lc-1",
        projectId: "p-1",
        designBasisId: "db-1",
        type: "LIVE", // simulated pressure 0.57 kN/m2
        description: "Roof Live",
        source: "USER",
        status: "PRELIMINARY",
        applications: [],
      }
    ];

    const demands = calculateSecondaryDemand(member, loadCases, 1.5);
    // line load = 0.57 * 1.5 = 0.855 kN/m
    // moment = wL^2 / 8 = 0.855 * 36 / 8 = 3.8475 kNm
    // shear = wL / 2 = 0.855 * 6 / 2 = 2.565 kN
    
    expect(demands).toHaveLength(1);
    expect(demands[0].moment_kNm).toBeCloseTo(3.8475, 4);
    expect(demands[0].shear_kN).toBeCloseTo(2.565, 4);
  });

  it("should return REQUIRES_ENGINEERING_REVIEW for cold-formed sections", () => {
    const member: Member = {
      id: "m-1",
      projectId: "p-1",
      startNodeId: "n-1",
      endNodeId: "n-2",
      label: "M-PURLIN-1",
      type: "PURLIN",
      length_m: 6.0,
      quantity: 1,
      weightStatus: "NOT_IMPLEMENTED",
      designGroup: ""
    };

    const demands: DesignDemand[] = [
      { loadCaseId: "lc-1", axial_kN: 0, moment_kNm: 5.0, shear_kN: 3.0, source: "TEST" }
    ];

    const section: Section = {
      id: "s-1",
      family: "Z_PURLIN",
      designation: "Z200",
      unitMass_kgpm: 4.5,
      area_mm2: 600,
      Ix_mm4: 4000000,
      Iy_mm4: 400000,
      Zx_mm3: 40000,
      Zy_mm3: 4000,
      rx_mm: 80,
      ry_mm: 20,
      catalogVersion: "1.0",
      source: "USER",
      geometryNotes: "",
    };

    const material: Material = {
      id: "mat-1",
      name: "ColdFormed",
      grade: "Yst310",
      fy_MPa: 310,
      fu_MPa: 450,
      E_MPa: 200000,
      poisson: 0.3,
      density_kgpm3: 7850,
      source: "USER",
      catalogVersion: "1.0"
    };

    const result = designSecondaryMember(member, "run-1", demands, [section], [material]);
    expect(result.status).toBe("REQUIRES_ENGINEERING_REVIEW");
    expect(result.evaluations[0].status).toBe("REQUIRES_ENGINEERING_REVIEW");
    expect(result.evaluations[0].failureReason).toContain("Effective-section design not implemented");
  });
});
