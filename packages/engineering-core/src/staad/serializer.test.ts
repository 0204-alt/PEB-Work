import { describe, it, expect } from "vitest";
import { generateStaadExport } from "./serializer.js";
import { CanonicalProject } from "../types.js";

const minimalValidProject: CanonicalProject = {
  id: "test-proj",
  schemaVersion: "0.1.0",
  applicationVersion: "0.1.0",
  metadata: {
    name: "Test Project",
    client: "Client A",
    location: "Location",
    buildingType: "PEB",
    code: "IS800",
  },
  designBasis: {} as any,
  geometry: {
    id: "g1",
    projectId: "test-proj",
    length_m: 10,
    width_m: 10,
    eaveHeight_m: 5,
    roofSlopeRiseRun: "1:10",
    gridLines: [],
    bays: [],
    spans: [],
    craneConfig: {
      craneEnabled: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  materials: [
    {
      id: "mat1",
      name: "E350",
      grade: "E350",
      fy_MPa: 350,
      fu_MPa: 490,
      E_MPa: 200000,
      poisson: 0.3,
      density_kgpm3: 7850,
      source: "IS 2062",
      catalogVersion: "1"
    }
  ],
  sections: [
    {
      id: "sec1",
      family: "BuiltUp",
      designation: "W300x150",
      unitMass_kgpm: 50,
      catalogVersion: "1",
      source: "user",
      area_mm2: 5000,
      Ix_mm4: 100000000,
      Iy_mm4: 20000000,
      geometryConfig: {
        type: "BUILT_UP",
        depth_mm: 300,
        webThickness_mm: 6,
        topFlangeWidth_mm: 150,
        topFlangeThickness_mm: 10,
        bottomFlangeWidth_mm: 150,
        bottomFlangeThickness_mm: 10
      }
    },
    {
      id: "sec2",
      family: "Tapered",
      designation: "Tap1",
      unitMass_kgpm: 60,
      catalogVersion: "1",
      source: "user",
      geometryConfig: {
        type: "TAPERED",
        startDepth_mm: 300,
        endDepth_mm: 600,
        webThickness_mm: 6,
        topFlangeWidth_mm: 150,
        topFlangeThickness_mm: 10,
        bottomFlangeWidth_mm: 150,
        bottomFlangeThickness_mm: 10,
        length_m: 5
      }
    }
  ],
  structuralModel: {
    nodes: [
      { id: "n1", projectId: "test-proj", label: "N1", x_m: 0, y_m: 0, z_m: 0, role: "BASE" },
      { id: "n2", projectId: "test-proj", label: "N2", x_m: 0, y_m: 5, z_m: 0, role: "EAVE" },
    ],
    members: [
      {
        id: "m1",
        projectId: "test-proj",
        label: "M1",
        type: "COLUMN",
        startNodeId: "n1",
        endNodeId: "n2",
        sectionId: "sec1",
        materialId: "mat1",
        length_m: 5,
        designGroup: "C1"
      }
    ],
    supports: [
      { id: "s1", nodeId: "n1", type: "PINNED", notes: "" }
    ],
    releases: []
  },
  loadCases: [],
  loadCombinations: [],
  connections: [],
  designRuns: [],
  analysisRuns: [],
  staadExportRecords: [],
  validation: {} as any,
  benchmark: {} as any,
  disclaimer: "test",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe("STAAD Serializer", () => {
  it("generates a basic STAAD model and marks EXPORT_WITH_WARNINGS", () => {
    const result = generateStaadExport(minimalValidProject);
    expect(result.status).toBe("EXPORT_WITH_WARNINGS");
    expect(result.content).toContain("STAAD SPACE");
    expect(result.content).toContain("JOINT COORDINATES");
    expect(result.content).toContain("MEMBER INCIDENCES");
    expect(result.content).toContain("PINNED");
    expect(result.content).toContain("PRISMATIC YD 0.3000 ZD 0.1500 YB 0.0060 ZB 0.0100");
    expect(result.content).toContain("* ANALYSIS_COMMAND_NOT_VERIFIED");
  });

  it("blocks export if tapered sections are present", () => {
    const proj = JSON.parse(JSON.stringify(minimalValidProject)) as CanonicalProject;
    proj.structuralModel.members[0].sectionId = "sec2"; // the tapered section

    const result = generateStaadExport(proj);
    expect(result.status).toBe("EXPORT_BLOCKED");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Tapered section Tap1 is UNSUPPORTED_SECTION");
  });

  it("blocks export if nodes or members are empty", () => {
    const proj = JSON.parse(JSON.stringify(minimalValidProject)) as CanonicalProject;
    proj.structuralModel.members = [];
    
    const result = generateStaadExport(proj);
    expect(result.status).toBe("EXPORT_BLOCKED");
    expect(result.errors).toContain("No members present in canonical model.");
  });

  it("supports Crane OFF logic", () => {
    const proj = JSON.parse(JSON.stringify(minimalValidProject)) as CanonicalProject;
    proj.geometry.craneConfig!.craneEnabled = false;
    proj.structuralModel.members.push({
      id: "m2",
      projectId: "test-proj",
      label: "M2",
      type: "CRANE_RUNWAY",
      startNodeId: "n1",
      endNodeId: "n2",
      sectionId: "sec1",
      materialId: "mat1",
      length_m: 5,
      designGroup: "CR1"
    });
    
    proj.loadCases.push({
      id: "lc1", projectId: "test-proj", type: "CRANE", description: "Crane",
      source: "user", designBasisId: "db1", status: "VALIDATED_INTERNAL",
      applications: []
    });

    const result = generateStaadExport(proj);
    // Because crane is off, the CRANE_RUNWAY should not be exported, and load cases of type CRANE should be skipped.
    expect(result.status).toBe("EXPORT_WITH_WARNINGS");
    expect(result.metadata.memberCount).toBe(1); // m2 is excluded
    expect(result.content).not.toContain("LOADTYPE CRANE"); // lc1 is excluded
  });

  it("converts kg/m3 to kN/m3 for materials", () => {
    const result = generateStaadExport(minimalValidProject);
    // 7850 kg/m3 * 9.80665 / 1000 = 76.9822 kN/m3
    expect(result.content).toContain("DENSITY 76.9822");
  });
});
