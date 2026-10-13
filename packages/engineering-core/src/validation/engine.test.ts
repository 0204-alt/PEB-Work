import { describe, it, expect } from "vitest";
import { validateProject } from "./engine.js";
import { CanonicalProject, ValidationRun } from "../types.js";
import { createId } from "../ids.js";

function getMinimalProject(): CanonicalProject {
  const projectId = createId();
  return {
    schemaVersion: 1,
    applicationVersion: "1.0.0",
    id: projectId,
    metadata: {
      name: "Test",
      client: "Test",
      location: "Test",
      buildingType: "PEB",
      code: "IS 800",
    },
    designBasis: {
      id: createId(),
      projectId,
      name: "Test Basis",
      standards: [
        {
          id: createId(),
          code: "IS 800:2007",
          title: "General Construction in Steel",
          edition: "2007",
          applicability: "APPLICABLE",
          notes: "",
        },
      ],
      wind: {
        locationName: "Test",
        basicWindSpeed_mps: 39,
        terrainCategory: "2",
        topographyFactor_k3: 1,
        importanceFactor_k1: 1,
        heightTerrainFactor_k2: 1,
        source: "User",
        status: "VALIDATED_INTERNAL",
        assumptions: [],
      },
      seismic: {
        zone: "III",
        applicable: true,
        source: "User",
        status: "VALIDATED_INTERNAL",
        notes: "",
      },
      units: { length: "m", force: "kN", mass: "kg" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    geometry: {
      id: createId(),
      projectId,
      length_m: 10,
      width_m: 10,
      eaveHeight_m: 5,
      roofSlopeRiseRun: "1:10",
      gridLines: [],
      bays: [],
      spans: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      craneConfig: {
        craneEnabled: false,
      },
    },
    materials: [
      {
        id: "mat-1",
        name: "S355",
        grade: "S355",
        fy_MPa: 355,
        fu_MPa: 470,
        E_MPa: 200000,
        poisson: 0.3,
        density_kgpm3: 7850,
        source: "EN 10025",
        catalogVersion: "1.0",
      },
    ],
    sections: [
      {
        id: "sec-1",
        family: "ROLLED",
        designation: "IPE 300",
        unitMass_kgpm: 42.2,
        area_mm2: 5380,
        source: "Catalog",
        catalogVersion: "1.0",
        geometryConfig: {
          type: "ROLLED",
        },
      },
    ],
    structuralModel: {
      nodes: [
        { id: "node-1", projectId, label: "N1", x_m: 0, y_m: 0, z_m: 0, role: "BASE", metadata: {} },
        { id: "node-2", projectId, label: "N2", x_m: 0, y_m: 5, z_m: 0, role: "EAVE", metadata: {} },
      ],
      members: [
        {
          id: "mem-1",
          projectId,
          label: "M1",
          type: "COLUMN",
          startNodeId: "node-1",
          endNodeId: "node-2",
          sectionId: "sec-1",
          materialId: "mat-1",
          length_m: 5,
          quantity: 1,
          designGroup: "",
          weightStatus: "VALIDATED_INTERNAL",
          unitMass_kgpm: 42.2,
          metadata: {},
        },
      ],
      supports: [
        { id: "sup-1", nodeId: "node-1", type: "PINNED", notes: "" },
      ],
      releases: [],
    },
    connections: [],
    loadCases: [],
    loadCombinations: [],
    designRuns: [],
    analysisRuns: [
      {
        id: createId(),
        projectId,
        provider: "UNAVAILABLE",
        providerVersion: "1.0",
        modelHash: "hash",
        status: "REQUIRES_ENGINEERING_REVIEW",
        diagnostics: [],
        memberResults: [],
        nodeResults: [],
        createdAt: new Date().toISOString(),
        duration_ms: 0,
      },
    ],
    staadExportRecords: [],
    validationRuns: [],
    benchmark: {
      enabled: false,
      note: "",
    },
    disclaimer: "Test",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("Validation Engine", () => {
  it("passes minimal valid project", () => {
    const project = getMinimalProject();
    const result = validateProject(project);

    // Filter out ANALYSIS_UNAVAILABLE warning which is expected
    const errors = result.findings.filter(f => f.severity === "ERROR");
    expect(errors.length).toBe(0);
    expect(result.gates?.projectSave).toBe("READY");
    expect(result.gates?.geometry).toBe("READY");
    expect(result.gates?.quantity).toBe("READY");
  });

  it("flags duplicate nodes", () => {
    const project = getMinimalProject();
    project.structuralModel.nodes.push({
      ...project.structuralModel.nodes[0],
      id: "node-dup",
      label: "N1_DUP",
    });

    const result = validateProject(project);
    const errors = result.findings.filter(f => f.code === "DUPLICATE_NODE");
    expect(errors.length).toBe(2); // Both nodes flagged
    expect(result.gates?.geometry).toBe("BLOCKED");
  });

  it("flags zero-length members", () => {
    const project = getMinimalProject();
    project.structuralModel.members.push({
      id: "mem-zero",
      projectId: project.id,
      label: "M_ZERO",
      type: "COLUMN",
      startNodeId: "node-1",
      endNodeId: "node-1",
      sectionId: "sec-1",
      materialId: "mat-1",
      length_m: 0,
      quantity: 1,
      designGroup: "",
      weightStatus: "VALIDATED_INTERNAL",
      unitMass_kgpm: 42.2,
      metadata: {},
    });

    const result = validateProject(project);
    const err = result.findings.find(f => f.code === "ZERO_LENGTH_MEMBER");
    expect(err).toBeDefined();
    expect(err?.blocking).toBe(true);
  });

  it("flags missing node references", () => {
    const project = getMinimalProject();
    project.structuralModel.members[0].startNodeId = "invalid-node";

    const result = validateProject(project);
    const err = result.findings.find(f => f.code === "INVALID_START_NODE");
    expect(err).toBeDefined();
    expect(result.gates?.geometry).toBe("BLOCKED");
  });

  it("flags self-weight double counting", () => {
    const project = getMinimalProject();
    project.loadCases.push({
      id: createId(),
      projectId: project.id,
      type: "DEAD",
      description: "Self Weight",
      source: "Manual",
      designBasisId: project.designBasis.id,
      status: "VALIDATED_INTERNAL",
      applications: [],
      metadata: {},
    });
    project.loadCases.push({
      id: createId(),
      projectId: project.id,
      type: "DEAD",
      description: "Additional Self Weight",
      source: "Manual",
      designBasisId: project.designBasis.id,
      status: "VALIDATED_INTERNAL",
      applications: [],
      metadata: {},
    });

    const result = validateProject(project);
    const err = result.findings.find(f => f.code === "SELF_WEIGHT_DOUBLE_COUNTING");
    expect(err).toBeDefined();
    expect(result.gates?.analysis).toBe("BLOCKED");
  });

  it("flags crane OFF isolation", () => {
    const project = getMinimalProject();
    project.geometry.craneConfig!.craneEnabled = false;
    project.structuralModel.members.push({
      id: "mem-crane",
      projectId: project.id,
      label: "CRANE_RUN",
      type: "CRANE_RUNWAY",
      startNodeId: "node-1",
      endNodeId: "node-2",
      sectionId: "sec-1",
      materialId: "mat-1",
      length_m: 5,
      quantity: 1,
      designGroup: "",
      weightStatus: "VALIDATED_INTERNAL",
      unitMass_kgpm: 42.2,
      metadata: {},
    });

    const result = validateProject(project);
    const err = result.findings.find(f => f.code === "ORPHAN_CRANE_MEMBERS");
    expect(err).toBeDefined();
  });

  it("flags analysis unavailable", () => {
    const project = getMinimalProject();
    const result = validateProject(project);
    const warn = result.findings.find(f => f.code === "ANALYSIS_UNAVAILABLE");
    expect(warn).toBeDefined();
    expect(result.gates?.analysis).toBe("PARTIALLY_READY");
  });

  it("blocks STAAD export for unsupported sections", () => {
    const project = getMinimalProject();
    project.sections.push({
      id: "sec-tapered",
      family: "TAPERED",
      designation: "TAP 1",
      unitMass_kgpm: 50,
      area_mm2: 6000,
      source: "User",
      catalogVersion: "1.0",
      geometryConfig: {
        type: "TAPERED",
        startDepth_mm: 500,
        endDepth_mm: 800,
        webThickness_mm: 6,
        topFlangeWidth_mm: 200,
        topFlangeThickness_mm: 10,
        bottomFlangeWidth_mm: 200,
        bottomFlangeThickness_mm: 10,
        length_m: 5,
      },
    });

    const result = validateProject(project);
    const err = result.findings.find(f => f.code === "UNSUPPORTED_STAAD_SECTION");
    expect(err).toBeDefined();
    expect(result.gates?.staadExport).toBe("BLOCKED");
  });

  it("flags kg/m2 quantity benchmark rejection", () => {
    const project = getMinimalProject();
    project.benchmark = {
      enabled: true,
      kgPerM2: 25,
      note: "Benchmark",
    };

    const result = validateProject(project);
    const warn = result.findings.find(f => f.code === "INVALID_QUANTITY_SOURCE");
    expect(warn).toBeDefined();
  });

  it("flags missing provenance", () => {
    const project = getMinimalProject();
    project.materials[0].source = "";

    const result = validateProject(project);
    const info = result.findings.find(f => f.code === "MISSING_MATERIAL_SOURCE");
    expect(info).toBeDefined();
  });
});
