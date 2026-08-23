import { describe, it, expect, beforeEach } from "vitest";
import {
  CanonicalProject,
  Member,
  Section,
  Geometry,
  DesignBasis,
} from "../types";
import { generateLoads } from "./generator";
import { calculateSelfWeight, generateDeadLoadCase } from "./dead";
import { generateLiveLoadCase } from "./live";
import { generateCollateralLoadCase } from "./collateral";
import { calculateWindLoads } from "./wind";
import { generateCraneLoads } from "./crane";
import { generateMezzanineLoads } from "./mezzanine";
import { generateCanopyLoads } from "./canopy";
import { generateCombinations } from "./combinations";
import { createId } from "../ids";
import { createEmptyProject } from "../emptyProject";

describe("Phase 4 - Load Engine", () => {
  let project: CanonicalProject;

  beforeEach(() => {
    project = createEmptyProject({
      name: "Test Project",
      location: "Test Location",
      buildingType: "Warehouse",
      length_m: 50,
      width_m: 20,
      eaveHeight_m: 6,
    });
    
    // Add a basic section and member for testing
    const section: Section = {
      id: createId(),
      family: "UB",
      designation: "UB 305x165x40",
      unitMass_kgpm: 40.3,
      catalogVersion: "1.0",
      source: "custom",
      geometryNotes: "",
    };
    project.sections.push(section);

    const member: Member = {
      id: createId(),
      projectId: project.id,
      label: "C1",
      type: "COLUMN",
      startNodeId: createId(),
      endNodeId: createId(),
      sectionId: section.id,
      designGroup: "",
      length_m: 5,
      quantity: 1,
      unitMass_kgpm: undefined,
      weightStatus: "PRELIMINARY",
    };
    project.structuralModel.members.push(member);

    project.structuralModel.nodes.push({
      id: createId(),
      projectId: project.id,
      label: "CR_SUPP",
      x_m: 0,
      y_m: 5,
      z_m: 0,
      role: "CRANE_SUPPORT",
      metadata: { craneId: "CR-1" }
    } as any);
  });

  describe("Load Cases", () => {
    it("1. Create dead-load case", () => {
      const lc = generateDeadLoadCase(project.id, project.designBasis.id, project.structuralModel.members, project.sections);
      expect(lc.type).toBe("DEAD");
    });
    it("2. Create imposed-load case", () => {
      const lc = generateLiveLoadCase(project.id, project.designBasis.id);
      expect(lc.type).toBe("LIVE");
    });
    it("3. Create collateral-load case", () => {
      const lc = generateCollateralLoadCase(project.id, project.designBasis.id);
      expect(lc.type).toBe("COLLATERAL");
    });
    it("4. Create wind case", () => {
      project.designBasis.wind.basicWindSpeed_mps = 39;
      const res = calculateWindLoads(project.id, project.designBasis, project.geometry);
      expect(res.cases.some((c) => c.type === "WIND_PLUS_X")).toBe(true);
    });
    it("5. Create crane case", () => {
      project.geometry.craneConfig = { craneEnabled: true, craneId: "CR-1", capacity_t: 10, craneSelfWeight_kN: 20, trolleyWeight_kN: 5, craneSpan_m: 10, numberOfWheels: 4, supplierDataAvailable: false, assumptions: [] };
      const res = generateCraneLoads(project.geometry.craneConfig, project.geometry, project.structuralModel.nodes, project.structuralModel.members, []);
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].type).toBe("CRANE");
    });
    it("6. Create mezzanine case", () => {
      project.geometry.mezzanineConfig = { enabled: true };
      const res = generateMezzanineLoads(project.id, project.designBasis.id, project.geometry);
      expect(res.some(c => c.type === "LIVE")).toBe(true);
    });
    it("7. Create canopy case", () => {
      project.geometry.canopyConfig = { enabled: true };
      const res = generateCanopyLoads(project.id, project.designBasis.id, project.geometry);
      expect(res.some(c => c.type === "DEAD")).toBe(true);
    });
  });

  describe("Dead Load", () => {
    it("9. Actual member self-weight relationship", () => {
      const member = project.structuralModel.members.find(m => m.label === "C1")!;
      const sw = calculateSelfWeight(member, project.sections);
      expect(sw).toBe((40.3 * 9.81) / 1000);
    });
    it("12. Invalid dead-load input handling", () => {
      const member: Member = { ...project.structuralModel.members.find(m => m.label === "C1")!, sectionId: undefined, unitMass_kgpm: undefined };
      const sw = calculateSelfWeight(member, project.sections);
      expect(sw).toBe(0);
    });
  });

  describe("Wind", () => {
    it("13. Wind input validation", () => {
      project.designBasis.wind.basicWindSpeed_mps = 0;
      const res = calculateWindLoads(project.id, project.designBasis, project.geometry);
      expect(res.errors.length).toBeGreaterThan(0);
      expect(res.cases.length).toBe(0);
    });
    it("14. Basic wind-speed handling", () => {
      project.designBasis.wind.basicWindSpeed_mps = 39;
      project.designBasis.wind.importanceFactor_k1 = 1;
      project.designBasis.wind.heightTerrainFactor_k2 = 1;
      project.designBasis.wind.topographyFactor_k3 = 1;
      const res = calculateWindLoads(project.id, project.designBasis, project.geometry);
      expect(res.cases.length).toBe(5); // 4 dir + 1 uplift
    });
    it("15. Design wind-speed calculation where verified", () => {
      project.designBasis.wind.basicWindSpeed_mps = 44;
      project.designBasis.wind.importanceFactor_k1 = 1;
      project.designBasis.wind.heightTerrainFactor_k2 = 0.9;
      project.designBasis.wind.topographyFactor_k3 = 1;
      const res = calculateWindLoads(project.id, project.designBasis, project.geometry);
      const Vz = 44 * 0.9;
      const Pz = 0.6 * Vz * Vz / 1000;
      expect(res.cases[0].applications[0].magnitude).toBeCloseTo(Pz);
    });
    it("17. Direction handling", () => {
      project.designBasis.wind.basicWindSpeed_mps = 39;
      const res = calculateWindLoads(project.id, project.designBasis, project.geometry);
      expect(res.cases.map(c => c.type)).toContain("WIND_PLUS_X");
      expect(res.cases.map(c => c.type)).toContain("WIND_MINUS_Z");
    });
    it("18. Uplift handling", () => {
      project.designBasis.wind.basicWindSpeed_mps = 39;
      const res = calculateWindLoads(project.id, project.designBasis, project.geometry);
      expect(res.cases.map(c => c.type)).toContain("UPLIFT");
    });
  });

  describe("Crane", () => {
    it("21. Crane OFF produces zero crane loads", () => {
      project.geometry.craneConfig = { craneEnabled: false, craneId: "CR-1", supplierDataAvailable: false, assumptions: [] };
      const res = generateCraneLoads(project.geometry.craneConfig, project.geometry, project.structuralModel.nodes, project.structuralModel.members, []);
      expect(res.length).toBe(0);
    });
    it("22. Crane ON generates crane cases", () => {
      project.geometry.craneConfig = { craneEnabled: true, craneId: "CR-1", capacity_t: 10, craneSelfWeight_kN: 20, trolleyWeight_kN: 5, craneSpan_m: 10, numberOfWheels: 4, supplierDataAvailable: false, assumptions: [] };
      const res = generateCraneLoads(project.geometry.craneConfig, project.geometry, project.structuralModel.nodes, project.structuralModel.members, []);
      expect(res.length).toBe(1);
    });
    it("23. Supplier data precedence yields review for missing methodology", () => {
      project.geometry.craneConfig = { craneEnabled: true, craneId: "CR-1", capacity_t: 10, craneSelfWeight_kN: 20, trolleyWeight_kN: 5, craneSpan_m: 10, numberOfWheels: 4, supplierDataAvailable: true, assumptions: [] };
      const res = generateCraneLoads(project.geometry.craneConfig, project.geometry, project.structuralModel.nodes, project.structuralModel.members, []);
      expect(res[0].status).toBe("REQUIRES_ENGINEERING_REVIEW");
    });
    it("24. Preliminary assumption flagging", () => {
      project.geometry.craneConfig = { craneEnabled: true, craneId: "CR-1", capacity_t: 10, craneSelfWeight_kN: 20, trolleyWeight_kN: 5, craneSpan_m: 10, numberOfWheels: 4, supplierDataAvailable: false, assumptions: [] };
      const res = generateCraneLoads(project.geometry.craneConfig, project.geometry, project.structuralModel.nodes, project.structuralModel.members, []);
      expect(res[0].status).toBe("REQUIRES_ENGINEERING_REVIEW");
    });
  });

  describe("Mezzanine / Canopy", () => {
    it("26. Disabled mezzanine produces no mezzanine loads", () => {
      project.geometry.mezzanineConfig = { enabled: false };
      const res = generateMezzanineLoads(project.id, project.designBasis.id, project.geometry);
      expect(res.length).toBe(0);
    });
    it("27. Enabled mezzanine produces required loads", () => {
      project.geometry.mezzanineConfig = { enabled: true };
      const res = generateMezzanineLoads(project.id, project.designBasis.id, project.geometry);
      expect(res.length).toBe(2);
    });
    it("28. Disabled canopy produces no canopy loads", () => {
      project.geometry.canopyConfig = { enabled: false };
      const res = generateCanopyLoads(project.id, project.designBasis.id, project.geometry);
      expect(res.length).toBe(0);
    });
    it("29. Enabled canopy produces required loads", () => {
      project.geometry.canopyConfig = { enabled: true };
      const res = generateCanopyLoads(project.id, project.designBasis.id, project.geometry);
      expect(res.length).toBe(1);
    });
  });

  describe("Combinations", () => {
    it("30. Valid combination", () => {
      project.designBasis.wind.basicWindSpeed_mps = 39;
      const res = generateLoads(project);
      expect(res.loadCombinations.length).toBeGreaterThan(0);
      const uls = res.loadCombinations.find(c => c.label.includes("1.5 (DL + LL)"));
      expect(uls).toBeDefined();
    });
  });

  describe("Traceability", () => {
    it("34-38. Every generated load can be traced back", () => {
      project.designBasis.wind.basicWindSpeed_mps = 39;
      project.geometry.craneConfig = { craneEnabled: true, supplierDataAvailable: false, assumptions: [] };
      project.geometry.mezzanineConfig = { enabled: true };
      const res = generateLoads(project);
      
      for (const lc of res.loadCases) {
        expect(lc.source).toBeTruthy();
        expect(lc.designBasisId).toBe(project.designBasis.id);
        
        for (const app of lc.applications) {
          expect(app.units).toBeTruthy();
          expect(app.source).toBeTruthy();
          expect(app.designBasisRef).toBeTruthy();
        }
      }
    });
  });
});
