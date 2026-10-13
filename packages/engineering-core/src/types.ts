import { z } from "zod";
import {
  APPLICATION_VERSION,
  PROJECT_SCHEMA_VERSION,
} from "@peb/shared";

const uuid = z.string().uuid();
const isoDate = z.string().datetime({ offset: true }).or(z.string().datetime());

export const CalculationStatusSchema = z.enum([
  "NOT_IMPLEMENTED",
  "REQUIRES_ENGINEERING_REVIEW",
  "PRELIMINARY",
  "VALIDATED_INTERNAL",
]);

export const AnalysisProviderTypeSchema = z.enum([
  "INTERNAL_SOLVER",
  "EXTERNAL_SOLVER",
  "IMPORTED_RESULT",
  "UNAVAILABLE",
]);

export const AnalysisStatusSchema = z.enum([
  "GENERATED",
  "VALIDATED",
  "SUBMITTED",
  "ANALYSING",
  "ANALYSED",
  "ANALYSIS_FAILED",
  "ANALYSIS_INVALID",
  "REQUIRES_ENGINEERING_REVIEW",
  "STALE_ANALYSIS",
  "ANALYSIS_BLOCKED",
]);

export const StaadExportStatusSchema = z.enum([
  "EXPORT_BLOCKED",
  "EXPORT_WITH_WARNINGS",
  "EXPORT_READY",
  "STAAD_FILE_GENERATED",
]);

export const AnalysisResultAuthenticitySchema = z.enum([
  "REAL_ANALYSIS_RESULT",
  "IMPORTED_ANALYSIS_RESULT",
  "PRELIMINARY_ESTIMATE",
  "NO_RESULT",
]);

export const CraneConfigSchema = z.object({
  craneEnabled: z.boolean(),
  craneId: z.string().optional(),
  craneType: z.string().optional(),
  runwayElevation_m: z.number().nonnegative().optional(),
  craneSpan_m: z.number().nonnegative().optional(),
  capacity_t: z.number().nonnegative().optional(),
  craneSelfWeight_kN: z.number().nonnegative().optional(),
  trolleyWeight_kN: z.number().nonnegative().optional(),
  numberOfWheels: z.number().int().positive().optional(),
  wheelSpacing_m: z.number().nonnegative().optional(),
  wheelbase_m: z.number().nonnegative().optional(),
  operatingCondition: z.string().optional(),
  verticalImpactMethodology: z.object({
    value: z.number(),
    source: z.string(),
    standard: z.string(),
    edition: z.string(),
    clause: z.string().optional(),
    verified: z.boolean().default(false),
  }).optional(),
  transverseMethodology: z.object({
    value: z.number(),
    source: z.string(),
    standard: z.string(),
    edition: z.string(),
    clause: z.string().optional(),
    verified: z.boolean().default(false),
  }).optional(),
  longitudinalMethodology: z.object({
    value: z.number(),
    source: z.string(),
    standard: z.string(),
    edition: z.string(),
    clause: z.string().optional(),
    verified: z.boolean().default(false),
  }).optional(),
  supplierDataAvailable: z.boolean().optional().default(false),
  assumptions: z.array(z.string()).optional().default([]),
});

export const MezzanineConfigSchema = z.object({
  enabled: z.boolean(),
  deadLoad_kNpm2: z.number().nonnegative().optional(),
  liveLoad_kNpm2: z.number().nonnegative().optional(),
});

export const CanopyConfigSchema = z.object({
  enabled: z.boolean(),
  deadLoad_kNpm2: z.number().nonnegative().optional(),
});

export const PurlinConfigSchema = z.object({
  enabled: z.boolean(),
  spacing_m: z.number().positive().optional(),
  sectionSelectionMode: z.enum(["AUTO", "MANUAL"]).default("AUTO"),
  sectionId: uuid.optional(),
  materialId: uuid.optional(),
  designMethod: z.string().optional(),
});

export const GirtConfigSchema = z.object({
  enabled: z.boolean(),
  spacing_m: z.number().positive().optional(),
  sectionSelectionMode: z.enum(["AUTO", "MANUAL"]).default("AUTO"),
  sectionId: uuid.optional(),
  materialId: uuid.optional(),
  designMethod: z.string().optional(),
});

export const EaveStrutConfigSchema = z.object({
  enabled: z.boolean(),
  sectionSelectionMode: z.enum(["AUTO", "MANUAL"]).default("AUTO"),
  sectionId: uuid.optional(),
  materialId: uuid.optional(),
});

export const SagRodConfigSchema = z.object({
  enabled: z.boolean(),
  spacingConfiguration: z.string().optional(),
  sectionId: uuid.optional(),
  materialId: uuid.optional(),
});

export const EndWallSecondaryConfigSchema = z.object({
  enabled: z.boolean(),
  spacing_m: z.number().positive().optional(),
  sectionSelectionMode: z.enum(["AUTO", "MANUAL"]).default("AUTO"),
  sectionId: uuid.optional(),
  materialId: uuid.optional(),
  designMethod: z.string().optional(),
});

export const BracingConfigSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(["X", "DIAGONAL", "CHEVRON"]),
  sectionType: z.enum(["ROD", "PIPE", "ANGLE"]),
  bays: z.array(z.number().int().nonnegative()).default([]), // array of bay indices
  sectionSelectionMode: z.enum(["AUTO", "MANUAL"]).default("AUTO"),
  sectionId: uuid.optional(),
  materialId: uuid.optional(),
  designMethod: z.string().optional(),
});

export const NodeRoleSchema = z.enum([
  "BASE",
  "EAVE",
  "RIDGE",
  "INTERMEDIATE_ROOF",
  "CRANE_SUPPORT",
  "PURLIN",
  "GIRT",
  "BRACING",
  "MEZZANINE",
  "CANOPY",
  "OTHER",
]);

export const MemberTypeSchema = z.enum([
  "COLUMN",
  "TAPERED_COLUMN",
  "RAFTER",
  "TAPERED_RAFTER",
  "END_WALL_COLUMN",
  "END_WALL_SECONDARY",
  "PURLIN",
  "GIRT",
  "EAVE_STRUT",
  "SAG_ROD",
  "ROOF_BRACING",
  "WALL_BRACING",
  "CRANE_COLUMN",
  "CRANE_RUNWAY",
  "MEZZANINE",
  "CANOPY",
  "OTHER",
]);

export const LoadCaseTypeSchema = z.enum([
  "DEAD",
  "LIVE",
  "COLLATERAL",
  "WIND_PLUS_X",
  "WIND_MINUS_X",
  "WIND_PLUS_Z",
  "WIND_MINUS_Z",
  "UPLIFT",
  "CRANE",
  "SEISMIC",
  "PROJECT_SPECIFIC",
]);

export const ValidationSeveritySchema = z.enum([
  "ERROR",
  "WARNING",
  "INFO",
  "REQUIRES_ENGINEERING_REVIEW",
  "NOT_YET_DEFINED",
  "UNSUPPORTED"
]);
export type ValidationSeverity = z.infer<typeof ValidationSeveritySchema>;

export const StandardRefSchema = z.object({
  id: uuid,
  code: z.string().min(1),
  title: z.string().min(1),
  edition: z.string().min(1),
  applicability: z.enum(["APPLICABLE", "NOT_APPLICABLE", "PROJECT_OVERRIDE"]),
  notes: z.string().default(""),
});

export const DesignBasisSchema = z.object({
  id: uuid,
  projectId: uuid,
  name: z.string().min(1),
  standards: z.array(StandardRefSchema),
  materialGradeId: uuid.optional(),
  wind: z.object({
    locationName: z.string().min(1),
    basicWindSpeed_mps: z.number().nonnegative(),
    terrainCategory: z.string().min(1),
    topographyFactor_k3: z.number().positive(),
    importanceFactor_k1: z.number().positive(),
    heightTerrainFactor_k2: z.number().positive(),
    designWindSpeed_mps: z.number().nonnegative().optional(),
    pressure_kNpm2: z.number().nonnegative().optional(),
    source: z.string().min(1),
    status: CalculationStatusSchema,
    assumptions: z.array(z.string()),
  }),
  seismic: z.object({
    zone: z.string().min(1),
    applicable: z.boolean(),
    source: z.string().min(1),
    status: CalculationStatusSchema,
    notes: z.string().default(""),
  }),
  units: z.object({
    length: z.literal("m"),
    force: z.literal("kN"),
    mass: z.literal("kg"),
  }),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const GridLineSchema = z.object({
  id: uuid,
  axis: z.enum(["X", "Z"]),
  index: z.number().int().nonnegative(),
  coordinate_m: z.number(),
  label: z.string().min(1),
});

export const BaySchema = z.object({
  id: uuid,
  index: z.number().int().nonnegative(),
  startX_m: z.number(),
  endX_m: z.number(),
  length_m: z.number().positive(),
});

export const SpanSchema = z.object({
  id: uuid,
  index: z.number().int().nonnegative(),
  startZ_m: z.number(),
  endZ_m: z.number(),
  width_m: z.number().positive(),
});

export const GeometrySchema = z.object({
  id: uuid,
  projectId: uuid,
  length_m: z.number().positive(),
  width_m: z.number().positive(),
  eaveHeight_m: z.number().positive(),
  roofSlopeRiseRun: z.string().min(1),
  baySpacing_m: z.number().positive().optional(),
  numberOfBays: z.number().int().positive().optional(),
  unequalFinalBay: z.boolean().optional().default(false),
  gridLines: z.array(GridLineSchema),
  bays: z.array(BaySchema),
  spans: z.array(SpanSchema),
  craneConfig: CraneConfigSchema.optional(),
  mezzanineConfig: MezzanineConfigSchema.optional(),
  canopyConfig: CanopyConfigSchema.optional(),
  endWallConfig: EndWallSecondaryConfigSchema.optional(),
  purlinConfig: PurlinConfigSchema.optional(),
  girtConfig: GirtConfigSchema.optional(),
  eaveStrutConfig: EaveStrutConfigSchema.optional(),
  sagRodConfig: SagRodConfigSchema.optional(),
  roofBracingConfig: BracingConfigSchema.optional(),
  wallBracingConfig: BracingConfigSchema.optional(),
  notes: z.array(z.string()).optional().default([]),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const NodeSchema = z.object({
  id: uuid,
  projectId: uuid,
  label: z.string().min(1),
  x_m: z.number(),
  y_m: z.number(),
  z_m: z.number(),
  role: NodeRoleSchema,
  gridLineId: uuid.optional(),
  bayId: uuid.optional(),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const MaterialSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  grade: z.string().min(1),
  fy_MPa: z.number().positive(),
  fu_MPa: z.number().positive(),
  E_MPa: z.number().positive(),
  poisson: z.number().positive(),
  density_kgpm3: z.number().positive(),
  source: z.string().min(1),
  catalogVersion: z.string().min(1),
});

export const BuiltUpGeometrySchema = z.object({
  type: z.literal("BUILT_UP"),
  depth_mm: z.number().positive(),
  webThickness_mm: z.number().positive(),
  topFlangeWidth_mm: z.number().positive(),
  topFlangeThickness_mm: z.number().positive(),
  bottomFlangeWidth_mm: z.number().positive(),
  bottomFlangeThickness_mm: z.number().positive(),
});

export const TaperedGeometrySchema = z.object({
  type: z.literal("TAPERED"),
  startDepth_mm: z.number().positive(),
  endDepth_mm: z.number().positive(),
  webThickness_mm: z.number().positive(),
  topFlangeWidth_mm: z.number().positive(),
  topFlangeThickness_mm: z.number().positive(),
  bottomFlangeWidth_mm: z.number().positive(),
  bottomFlangeThickness_mm: z.number().positive(),
  length_m: z.number().positive(),
});

export const RolledGeometrySchema = z.object({
  type: z.literal("ROLLED"),
});

export const SectionGeometryConfigSchema = z.discriminatedUnion("type", [
  BuiltUpGeometrySchema,
  TaperedGeometrySchema,
  RolledGeometrySchema,
]);

export const SectionSchema = z.object({
  id: uuid,
  family: z.string().min(1),
  designation: z.string().min(1),
  area_mm2: z.number().nonnegative().optional(),
  Ix_mm4: z.number().nonnegative().optional(),
  Iy_mm4: z.number().nonnegative().optional(),
  Zx_mm3: z.number().nonnegative().optional(),
  Zy_mm3: z.number().nonnegative().optional(),
  rx_mm: z.number().nonnegative().optional(),
  ry_mm: z.number().nonnegative().optional(),
  unitMass_kgpm: z.number().nonnegative(),
  materialId: uuid.optional(),
  geometryNotes: z.string().optional().default(""),
  geometryConfig: SectionGeometryConfigSchema.optional(),
  catalogVersion: z.string().min(1),
  source: z.string().min(1),
});

export const ReleaseSchema = z.object({
  id: uuid,
  memberId: uuid,
  startFx: z.boolean().default(false),
  startFy: z.boolean().default(false),
  startFz: z.boolean().default(false),
  startMx: z.boolean().default(false),
  startMy: z.boolean().default(false),
  startMz: z.boolean().default(false),
  endFx: z.boolean().default(false),
  endFy: z.boolean().default(false),
  endFz: z.boolean().default(false),
  endMx: z.boolean().default(false),
  endMy: z.boolean().default(false),
  endMz: z.boolean().default(false),
});

export const SupportSchema = z.object({
  id: uuid,
  nodeId: uuid,
  type: z.enum(["PINNED", "FIXED", "FIXED_BUT", "CUSTOM"]),
  notes: z.string().default(""),
});

export const MemberSchema = z.object({
  id: uuid,
  projectId: uuid,
  label: z.string().min(1),
  type: MemberTypeSchema,
  startNodeId: uuid,
  endNodeId: uuid,
  sectionId: uuid.optional(),
  materialId: uuid.optional(),
  designGroup: z.string().optional().default(""),
  length_m: z.number().nonnegative(),
  quantity: z.number().positive().optional().default(1),
  unitMass_kgpm: z.number().nonnegative().optional(),
  totalWeight_kg: z.number().nonnegative().optional(),
  weightStatus: CalculationStatusSchema.optional().default("NOT_IMPLEMENTED"),
  metadata: z.record(z.unknown()).optional(),
});

export const LoadApplicationSchema = z.object({
  id: uuid,
  loadCaseId: uuid,
  targetType: z.enum(["MEMBER", "NODE", "MEMBER_GROUP", "ROOF_SURFACE", "WALL_SURFACE", "CRANE_SUPPORT", "MEZZANINE", "CANOPY"]),
  targetId: uuid,
  magnitude: z.number(),
  direction: z.enum(["GX", "GY", "GZ", "MX", "MY", "MZ", "LOCAL_Y", "LOCAL_Z"]),
  units: z.string().min(1),
  source: z.string().min(1),
  designBasisRef: z.string().min(1),
  description: z.string().optional().default(""),
  metadata: z.record(z.unknown()).optional(),
});

export const LoadCaseSchema = z.object({
  id: uuid,
  projectId: uuid,
  type: LoadCaseTypeSchema,
  description: z.string().min(1),
  source: z.string().min(1),
  designBasisId: uuid,
  status: CalculationStatusSchema,
  applications: z.array(LoadApplicationSchema).optional().default([]),
  metadata: z.record(z.unknown()).optional(),
});

export const LoadCombinationSchema = z.object({
  id: uuid,
  projectId: uuid,
  label: z.string().min(1),
  category: z.enum(["ULS", "SLS", "OTHER"]),
  source: z.string().min(1),
  status: CalculationStatusSchema,
  factors: z.array(
    z.object({
      loadCaseId: uuid,
      factor: z.number(),
    }),
  ),
});

export const OperationReadinessSchema = z.enum([
  "READY",
  "PARTIALLY_READY",
  "BLOCKED",
  "NOT_AVAILABLE",
]);

export const ValidationFindingSchema = z.object({
  id: uuid,
  runId: uuid,
  severity: ValidationSeveritySchema,
  category: z.string().min(1),
  code: z.string().min(1),
  message: z.string().min(1),
  technicalExplanation: z.string().default(""),
  entityType: z.string().optional().nullable(),
  entityId: uuid.optional().nullable(),
  source: z.string().default("ENGINE"),
  ruleRef: z.string().default(""),
  blocking: z.boolean().default(false),
  remediationGuidance: z.string().default(""),
  createdAt: isoDate,
  updatedAt: isoDate.optional(),
});

export const ValidationRunSchema = z.object({
  id: uuid,
  projectId: uuid,
  modelHash: z.string(),
  exportBlocked: z.boolean(),
  findings: z.array(ValidationFindingSchema).default([]),
  gates: z.object({
    projectSave: OperationReadinessSchema,
    geometry: OperationReadinessSchema,
    design: OperationReadinessSchema,
    analysis: OperationReadinessSchema,
    staadExport: OperationReadinessSchema,
    quantity: OperationReadinessSchema,
  }).optional(),
  createdAt: isoDate,
  updatedAt: isoDate.optional(),
});

export const BenchmarkComparisonSchema = z.object({
  enabled: z.boolean(),
  kgPerM2: z.number().nonnegative().optional(),
  benchmarkMass_kg: z.number().nonnegative().optional(),
  engineeringMass_kg: z.number().nonnegative().optional(),
  difference_kg: z.number().optional(),
  note: z.string(),
});

export const ProjectMetadataSchema = z.object({
  name: z.string().min(1),
  client: z.string().default(""),
  location: z.string().min(1),
  buildingType: z.string().min(1),
  code: z.string().min(1),
});

export const CandidateEvaluationSchema = z.object({
  id: uuid,
  memberDesignResultId: uuid,
  sectionId: uuid,
  status: z.string().min(1),
  governingCheck: z.string().min(1),
  utilization: z.number().nullable().optional(),
  failureReason: z.string().nullable().optional(),
  rank: z.number().int().nonnegative(),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const MemberDesignResultSchema = z.object({
  id: uuid,
  designRunId: uuid,
  memberId: uuid,
  sectionId: uuid.nullable().optional(),
  materialId: uuid.nullable().optional(),
  governingLoadCaseId: uuid.nullable().optional(),
  axialDemand: z.number().nullable().optional(),
  axialResistance: z.number().nullable().optional(),
  bendingDemand: z.number().nullable().optional(),
  bendingResistance: z.number().nullable().optional(),
  shearDemand: z.number().nullable().optional(),
  shearResistance: z.number().nullable().optional(),
  utilization: z.number().nullable().optional(),
  slenderness: z.number().nullable().optional(),
  status: z.string().min(1),
  warnings: z.record(z.unknown()).nullable().optional(),
  evaluations: z.array(CandidateEvaluationSchema).default([]),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const DesignRunSchema = z.object({
  id: uuid,
  projectId: uuid,
  status: z.string().min(1),
  errors: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  memberResults: z.array(MemberDesignResultSchema).default([]),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const AnalysisMemberResultSchema = z.object({
  id: uuid,
  analysisRunId: uuid,
  memberId: uuid,
  loadCaseId: uuid.nullable().optional(),
  combinationId: uuid.nullable().optional(),
  axialForce_kN: z.number(),
  shearForceY_kN: z.number(),
  shearForceZ_kN: z.number(),
  bendingMomentY_kNm: z.number(),
  bendingMomentZ_kNm: z.number(),
  torsion_kNm: z.number(),
  displacement_mm: z.number(),
  authenticity: AnalysisResultAuthenticitySchema,
});

export const AnalysisNodeResultSchema = z.object({
  id: uuid,
  analysisRunId: uuid,
  nodeId: uuid,
  loadCaseId: uuid.nullable().optional(),
  combinationId: uuid.nullable().optional(),
  reactionFx_kN: z.number(),
  reactionFy_kN: z.number(),
  reactionFz_kN: z.number(),
  reactionMx_kNm: z.number(),
  reactionMy_kNm: z.number(),
  reactionMz_kNm: z.number(),
  displacementX_mm: z.number(),
  displacementY_mm: z.number(),
  displacementZ_mm: z.number(),
  authenticity: AnalysisResultAuthenticitySchema,
});

export const AnalysisRunSchema = z.object({
  id: uuid,
  projectId: uuid,
  provider: AnalysisProviderTypeSchema,
  providerVersion: z.string(),
  modelHash: z.string(),
  status: AnalysisStatusSchema,
  diagnostics: z.array(z.string()).default([]),
  memberResults: z.array(AnalysisMemberResultSchema).default([]),
  nodeResults: z.array(AnalysisNodeResultSchema).default([]),
  createdAt: isoDate,
  duration_ms: z.number().nonnegative(),
});

export const StaadExportRecordSchema = z.object({
  id: uuid,
  projectId: uuid,
  modelHash: z.string(),
  serializerVersion: z.string(),
  status: StaadExportStatusSchema,
  warnings: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([]),
  referenceAvailable: z.boolean(),
  staadVersionVerified: z.boolean(),
  createdAt: isoDate,
});

export const DesignDemandSchema = z.object({
  axial_kN: z.number(),
  shear_kN: z.number(),
  moment_kNm: z.number(),
  source: z.string().min(1),
  loadCaseId: uuid,
});

export const StructuralModelSchema = z.object({
  nodes: z.array(NodeSchema),
  members: z.array(MemberSchema),
  supports: z.array(SupportSchema),
  releases: z.array(ReleaseSchema),
});

export const ConnectionComponentStatusSchema = z.enum([
  "NOT_YET_DEFINED",
  "PRELIMINARY",
  "VERIFIED",
]);

export const ConnectionStatusSchema = z.enum([
  "NOT_YET_DEFINED",
  "REQUIRES_ENGINEERING_REVIEW",
  "PASS",
  "FAIL",
]);

export const ConnectionTypeSchema = z.enum([
  "RAFTER_SPLICE",
  "COLUMN_SPLICE",
  "RAFTER_COLUMN",
  "CRANE_BRACKET",
  "BRACING",
  "PURLIN",
  "GIRT",
  "BASE_PLATE",
  "ANCHOR_BOLTS",
]);

export const ConnectionComponentSchema = z.object({
  id: uuid,
  connectionId: uuid,
  type: z.enum(["PLATE", "BOLT", "WELD", "GUSSET", "CLEAT", "BASE_PLATE", "ANCHOR_BOLT", "BRACKET", "STIFFENER"]),
  materialId: uuid.optional(),
  dimensions: z.record(z.unknown()).default({}),
  quantity: z.number().int().nonnegative().default(1),
  mass_kg: z.number().nonnegative().default(0),
  status: ConnectionComponentStatusSchema.default("NOT_YET_DEFINED"),
  source: z.string().default(""),
});

export const ConnectionSchema = z.object({
  id: uuid,
  projectId: uuid,
  type: ConnectionTypeSchema,
  nodeId: uuid.optional(),
  sourceMemberIds: z.array(uuid).default([]),
  status: ConnectionStatusSchema.default("NOT_YET_DEFINED"),
  components: z.array(ConnectionComponentSchema).default([]),
  metadata: z.record(z.unknown()).default({}),
});

export const CanonicalProjectSchema = z.object({
  schemaVersion: z.literal(PROJECT_SCHEMA_VERSION),
  applicationVersion: z.string().min(1),
  id: uuid,
  metadata: ProjectMetadataSchema,
  designBasis: DesignBasisSchema,
  geometry: GeometrySchema,
  materials: z.array(MaterialSchema),
  sections: z.array(SectionSchema),
  structuralModel: StructuralModelSchema,
  connections: z.array(ConnectionSchema).default([]),
  loadCases: z.array(LoadCaseSchema),
  loadCombinations: z.array(LoadCombinationSchema).default([]),
  designRuns: z.array(DesignRunSchema).default([]),
  analysisRuns: z.array(AnalysisRunSchema).default([]),
  staadExportRecords: z.array(StaadExportRecordSchema).default([]),
  validationRuns: z.array(ValidationRunSchema).default([]),
  benchmark: BenchmarkComparisonSchema,
  disclaimer: z.string().min(1),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export type CanonicalProject = z.infer<typeof CanonicalProjectSchema>;
export type DesignBasis = z.infer<typeof DesignBasisSchema>;
export type Geometry = z.infer<typeof GeometrySchema>;
export type Node = z.infer<typeof NodeSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type LoadCase = z.infer<typeof LoadCaseSchema>;
export type LoadCombination = z.infer<typeof LoadCombinationSchema>;
export type ValidationRun = z.infer<typeof ValidationRunSchema>;
export type ValidationFinding = z.infer<typeof ValidationFindingSchema>;
export type OperationReadiness = z.infer<typeof OperationReadinessSchema>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type MemberDesignResult = z.infer<typeof MemberDesignResultSchema>;
export type CandidateEvaluation = z.infer<typeof CandidateEvaluationSchema>;
export type DesignRun = z.infer<typeof DesignRunSchema>;
export type DesignDemand = z.infer<typeof DesignDemandSchema>;
export type AnalysisRun = z.infer<typeof AnalysisRunSchema>;
export type AnalysisMemberResult = z.infer<typeof AnalysisMemberResultSchema>;
export type AnalysisNodeResult = z.infer<typeof AnalysisNodeResultSchema>;
export type StaadExportRecord = z.infer<typeof StaadExportRecordSchema>;

export type Connection = z.infer<typeof ConnectionSchema>;
export type ConnectionComponent = z.infer<typeof ConnectionComponentSchema>;

export type GridLine = z.infer<typeof GridLineSchema>;
export type Bay = z.infer<typeof BaySchema>;
export type Span = z.infer<typeof SpanSchema>;
export type BracingConfig = z.infer<typeof BracingConfigSchema>;
export type CraneConfig = z.infer<typeof CraneConfigSchema>;
export type LoadApplication = z.infer<typeof LoadApplicationSchema>;

export { APPLICATION_VERSION, PROJECT_SCHEMA_VERSION };
