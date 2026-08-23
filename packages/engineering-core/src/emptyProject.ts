import { ENGINEERING_DISCLAIMER } from "@peb/shared";
import { createId } from "./ids.js";
import {
  APPLICATION_VERSION,
  CanonicalProjectSchema,
  PROJECT_SCHEMA_VERSION,
  type Geometry,
  type CanonicalProject,
} from "./types.js";
import { generateGeometry } from "./geometry.js";
import { generateSecondarySteel } from "./secondaryGeometry.js";
import { generateBracing } from "./bracingGeometry.js";
import { generateCraneGeometry } from "./craneGeometry.js";
import { generateConnections } from "./connections.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function createEmptyProject(input: {
  name: string;
  location: string;
  buildingType: string;
  length_m: number;
  width_m: number;
  eaveHeight_m: number;
  client?: string;
  code?: string;
}): CanonicalProject {
  const id = createId();
  const designBasisId = createId();
  const geometryId = createId();
  const validationId = createId();
  const ts = nowIso();
  const spanId = createId();

  const geometryConfig: Geometry = {
    id: geometryId,
    projectId: id,
    length_m: input.length_m,
    width_m: input.width_m,
    eaveHeight_m: input.eaveHeight_m,
    roofSlopeRiseRun: "1:10",
    unequalFinalBay: false,
    gridLines: [],
    bays: [],
    spans: [
      {
        id: spanId,
        index: 0,
        startZ_m: 0,
        endZ_m: input.width_m,
        width_m: input.width_m,
      },
    ],
    notes: [
      "Coordinate system: X = length, Y = vertical, Z = width.",
    ],
    purlinConfig: { enabled: true, spacing_m: 1.5, sectionSelectionMode: "AUTO" },
    girtConfig: { enabled: true, spacing_m: 2.0, sectionSelectionMode: "AUTO" },
    eaveStrutConfig: { enabled: true, sectionSelectionMode: "AUTO" },
    endWallConfig: { enabled: true, spacing_m: 2.0, sectionSelectionMode: "AUTO" },
    sagRodConfig: { enabled: true, spacingConfiguration: "MIDSPAN", sectionSelectionMode: "AUTO" },
    roofBracingConfig: { enabled: true, type: "X", sectionType: "ROD", bays: [0], sectionSelectionMode: "AUTO" },
    wallBracingConfig: { enabled: true, type: "X", sectionType: "ROD", bays: [0], sectionSelectionMode: "AUTO" },
    craneConfig: {
      craneEnabled: true,
      craneId: "CR-01",
      craneType: "Top Running",
      runwayElevation_m: 5.0,
      craneSpan_m: input.width_m,
      capacity_t: 5,
      craneSelfWeight_kN: 40,
      trolleyWeight_kN: 5,
      numberOfWheels: 4,
      wheelSpacing_m: 3.5,
      supplierDataAvailable: false,
      verticalImpactMethodology: { value: 0.25, source: "Default Assumption", standard: "IS 875", edition: "2015", verified: false },
      transverseMethodology: { value: 0.10, source: "Default Assumption", standard: "IS 875", edition: "2015", verified: false },
      longitudinalMethodology: { value: 0.05, source: "Default Assumption", standard: "IS 875", edition: "2015", verified: false }
    },
    createdAt: ts,
    updatedAt: ts,
  };

  const primaryGeometry = generateGeometry(geometryConfig);
  const withSecondary = generateSecondarySteel(geometryConfig, primaryGeometry);
  const geometryResult = generateBracing(geometryConfig, withSecondary);
  
  if (geometryConfig.craneConfig) {
    generateCraneGeometry(
      geometryConfig.craneConfig,
      geometryConfig,
      geometryResult.nodes,
      geometryResult.members
    );
  }

  const project: CanonicalProject = {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    applicationVersion: APPLICATION_VERSION,
    id,
    metadata: {
      name: input.name,
      client: input.client ?? "",
      location: input.location,
      buildingType: input.buildingType,
      code: input.code ?? `PEB-${id.slice(0, 8).toUpperCase()}`,
    },
    designBasis: {
      id: designBasisId,
      projectId: id,
      name: "Project design basis (editions not yet confirmed)",
      standards: [
        {
          id: createId(),
          code: "IS 800",
          title: "General Construction in Steel",
          edition: "TO_BE_CONFIRMED",
          applicability: "APPLICABLE",
          notes: "Edition must be selected at project setup. No design clauses are applied in Phase 1.",
        },
        {
          id: createId(),
          code: "IS 875 (Part 1)",
          title: "Dead loads",
          edition: "TO_BE_CONFIRMED",
          applicability: "APPLICABLE",
          notes: "",
        },
        {
          id: createId(),
          code: "IS 875 (Part 2)",
          title: "Imposed loads",
          edition: "TO_BE_CONFIRMED",
          applicability: "APPLICABLE",
          notes: "",
        },
        {
          id: createId(),
          code: "IS 875 (Part 3)",
          title: "Wind loads",
          edition: "TO_BE_CONFIRMED",
          applicability: "APPLICABLE",
          notes: "",
        },
        {
          id: createId(),
          code: "IS 1893",
          title: "Earthquake resistant design",
          edition: "TO_BE_CONFIRMED",
          applicability: "NOT_APPLICABLE",
          notes: "Not applied until enabled and edition confirmed.",
        },
      ],
      wind: {
        locationName: input.location,
        basicWindSpeed_mps: 0,
        terrainCategory: "UNSET",
        topographyFactor_k3: 1,
        importanceFactor_k1: 1,
        heightTerrainFactor_k2: 1,
        source: "NOT_IMPLEMENTED — design-basis wind engine is Phase 4",
        status: "NOT_IMPLEMENTED",
        assumptions: [
          "Basic wind speed is not inferred in Phase 1.",
          "V11.9 city lookup is frozen as legacy data and is not an authoritative code table until sourced.",
        ],
      },
      seismic: {
        zone: "UNSET",
        applicable: false,
        source: "NOT_IMPLEMENTED",
        status: "NOT_IMPLEMENTED",
        notes: "",
      },
      units: { length: "m", force: "kN", mass: "kg" },
      createdAt: ts,
      updatedAt: ts,
    },
    geometry: {
      ...geometryConfig,
      gridLines: geometryResult.gridLines,
      bays: geometryResult.bays,
      spans: geometryResult.spans,
    },
    materials: [],
    sections: [],
    structuralModel: {
      nodes: geometryResult.nodes,
      members: geometryResult.members,
      supports: [],
      releases: [],
    },
    loadCases: [],
    loadCombinations: [],
    validation: {
      id: validationId,
      projectId: id,
      exportBlocked: true,
      issues: [
        {
          id: createId(),
          severity: "CRITICAL",
          code: "MODEL_EMPTY",
          message:
            "Structural model has no nodes or members. STAAD export is blocked until geometry generation exists.",
        },
        {
          id: createId(),
          severity: "INFORMATION",
          code: "PHASE1_DOMAIN_ONLY",
          message:
            "Phase 1 persists the canonical domain. Engineering calculations are not implemented.",
        },
      ],
      createdAt: ts,
    },
    benchmark: {
      enabled: false,
      note: "Benchmark kg/m² is comparison-only. It must never scale engineering quantities.",
    },
    disclaimer: ENGINEERING_DISCLAIMER,
    createdAt: ts,
    updatedAt: ts,
  };

  project.connections = generateConnections(project);

  return CanonicalProjectSchema.parse(project);
}
