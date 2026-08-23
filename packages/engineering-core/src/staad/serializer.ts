import { CanonicalProject } from "../types.js";
import { StaadContext, StaadExportResult } from "./types.js";
import { preValidateStaadExport, postValidateStaadExport } from "./validation.js";
import { setStaadUnits } from "./units.js";
import { serializeNodes } from "./nodes.js";
import { serializeMembers } from "./members.js";
import { serializeMaterials } from "./materials.js";
import { serializeProperties } from "./properties.js";
import { serializeSupports } from "./supports.js";
import { serializeLoads } from "./loads.js";
import { serializeCombinations } from "./combinations.js";
import { computeAnalysisHash } from "../hash.js";

const SERIALIZER_VERSION = "1.0.0";

export function generateStaadExport(project: CanonicalProject): StaadExportResult {
  const ctx: StaadContext = {
    projectId: project.id,
    lines: [],
    nodeMap: new Map(),
    memberMap: new Map(),
    loadCaseMap: new Map(),
    warnings: [],
    errors: [],
    supportedSections: new Set(),
    nextNodeId: 1,
    nextMemberId: 1,
    nextLoadCaseId: 1,
  };

  // 1. Initial Checks
  preValidateStaadExport(project, ctx);
  if (ctx.errors.length > 0) {
    return createBlockedResult(ctx);
  }

  // 2. Generate Header
  ctx.lines.push("STAAD SPACE");
  ctx.lines.push("START JOB INFORMATION");
  ctx.lines.push(`ENGINEER DATE ${new Date().toISOString().split('T')[0]}`);
  ctx.lines.push(`JOB NAME ${project.metadata.name}`);
  if (project.metadata.client) {
    ctx.lines.push(`JOB CLIENT ${project.metadata.client}`);
  }
  ctx.lines.push("END JOB INFORMATION");
  
  // 3. Set Base Units
  setStaadUnits(ctx);

  // 4. Serialize Entities
  serializeNodes(project, ctx);
  serializeMembers(project, ctx);
  serializeMaterials(project, ctx);
  serializeProperties(project, ctx);
  serializeSupports(project, ctx);
  serializeLoads(project, ctx);
  serializeCombinations(project, ctx);

  // 5. Explicitly omit PERFORM ANALYSIS unless verified
  ctx.lines.push("* ANALYSIS_COMMAND_NOT_VERIFIED");
  ctx.warnings.push("STAAD input generation does not constitute structural analysis. PERFORM ANALYSIS omitted.");
  
  ctx.lines.push("FINISH");

  // 6. Post Validation
  postValidateStaadExport(ctx);
  
  if (ctx.errors.length > 0) {
    return createBlockedResult(ctx);
  }

  const modelHash = computeAnalysisHash(project);

  return {
    content: ctx.lines.join("\n"),
    metadata: {
      modelHash,
      serializerVersion: SERIALIZER_VERSION,
      nodeCount: ctx.nodeMap.size,
      memberCount: ctx.memberMap.size,
    },
    warnings: ctx.warnings,
    errors: ctx.errors,
    status: ctx.warnings.length > 0 ? "EXPORT_WITH_WARNINGS" : "EXPORT_READY",
  };
}

function createBlockedResult(ctx: StaadContext): StaadExportResult {
  return {
    content: "",
    metadata: {
      modelHash: "",
      serializerVersion: SERIALIZER_VERSION,
      nodeCount: 0,
      memberCount: 0,
    },
    warnings: ctx.warnings,
    errors: ctx.errors,
    status: "EXPORT_BLOCKED",
  };
}
