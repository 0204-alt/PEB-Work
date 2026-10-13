import { CanonicalProject, ValidationRun } from "../types.js";
import { createId } from "../ids.js";
import { computeAnalysisHash } from "../hash.js";
import { ValidationContext, ValidatorFunc } from "./types.js";
import { validateGeometry } from "./validators/geometry.js";
import { validateMembers } from "./validators/members.js";
import { validateSections } from "./validators/sections.js";
import { validateMaterials } from "./validators/materials.js";
import { validateConnectivity } from "./validators/releases.js";
import { validateLoads } from "./validators/loads.js";
import { validateDesign } from "./validators/design.js";
import { validateSecondary } from "./validators/secondary.js";
import { validateBracing } from "./validators/bracing.js";
import { validateCrane } from "./validators/crane.js";
import { validateConnections } from "./validators/connections.js";
import { validateAnalysis } from "./validators/analysis.js";
import { validateStaad } from "./validators/staad.js";
import { validateQuantity } from "./validators/quantity.js";
import { validateProvenance } from "./validators/provenance.js";

// Registry of validators
const VALIDATORS: ValidatorFunc[] = [
  validateGeometry,
  validateMembers,
  validateSections,
  validateMaterials,
  validateConnectivity,
  validateLoads,
  validateDesign,
  validateSecondary,
  validateBracing,
  validateCrane,
  validateConnections,
  validateAnalysis,
  validateStaad,
  validateQuantity,
  validateProvenance,
];

export function registerValidator(validator: ValidatorFunc) {
  VALIDATORS.push(validator);
}

export function validateProject(project: CanonicalProject): ValidationRun {
  const ctx: ValidationContext = {
    project,
    runId: createId(),
    findings: [],
    gates: {
      projectSave: "READY",
      geometry: "READY",
      design: "READY",
      analysis: "READY",
      staadExport: "READY",
      quantity: "READY",
    },
  };

  // Run all validators
  for (const validator of VALIDATORS) {
    try {
      validator(ctx);
    } catch (e) {
      console.error("Validator threw an error:", e);
      ctx.findings.push({
        id: createId(),
        runId: ctx.runId,
        severity: "ERROR",
        category: "SYSTEM",
        code: "VALIDATOR_CRASH",
        message: `A validator crashed: ${e instanceof Error ? e.message : String(e)}`,
        technicalExplanation: e instanceof Error ? e.stack || "" : "",
        source: "ENGINE",
        ruleRef: "",
        blocking: true,
        remediationGuidance: "Contact support.",
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Compute gates based on findings
  let hasGeometryError = false;
  let hasGeometryWarning = false;
  let hasConnectivityError = false;
  let hasLoadsError = false;
  let hasAnalysisError = false;
  let hasAnalysisWarning = false;
  let hasQuantityError = false;
  let hasQuantityWarning = false;
  let hasStaadError = false;
  let hasStaadWarning = false;
  let hasDesignError = false;

  for (const finding of ctx.findings) {
    if (finding.severity === "ERROR" || finding.severity === "UNSUPPORTED") {
      if (finding.category === "GEOMETRY" || finding.category === "MEMBERS") hasGeometryError = true;
      if (finding.category === "CONNECTIVITY" || finding.category === "SUPPORTS" || finding.category === "RELEASES") hasConnectivityError = true;
      if (finding.category === "LOADS" || finding.category === "COMBINATIONS") hasLoadsError = true;
      if (finding.category === "ANALYSIS") hasAnalysisError = true;
      if (finding.category === "QUANTITY") hasQuantityError = true;
      if (finding.category === "STAAD") hasStaadError = true;
      if (finding.category === "DESIGN") hasDesignError = true;
    }
    if (finding.severity === "WARNING" || finding.severity === "REQUIRES_ENGINEERING_REVIEW") {
      if (finding.category === "GEOMETRY") hasGeometryWarning = true;
      if (finding.category === "ANALYSIS") hasAnalysisWarning = true;
      if (finding.category === "QUANTITY") hasQuantityWarning = true;
      if (finding.category === "STAAD") hasStaadWarning = true;
    }
  }

  // Logic for Geometry Gate
  if (hasGeometryError || hasConnectivityError) {
    ctx.gates.geometry = "BLOCKED";
  } else if (hasGeometryWarning) {
    ctx.gates.geometry = "PARTIALLY_READY";
  }

  // Logic for Design Gate
  if (ctx.gates.geometry === "BLOCKED" || hasLoadsError || hasDesignError) {
    ctx.gates.design = "BLOCKED";
  }

  // Logic for Analysis Gate
  if (ctx.gates.geometry === "BLOCKED" || hasLoadsError) {
    ctx.gates.analysis = "BLOCKED";
  } else if (hasAnalysisError) {
    ctx.gates.analysis = "NOT_AVAILABLE";
  } else if (hasAnalysisWarning) {
    ctx.gates.analysis = "PARTIALLY_READY";
  }

  // Logic for STAAD Export Gate
  if (ctx.gates.geometry === "BLOCKED") {
    ctx.gates.staadExport = "BLOCKED";
  } else if (hasStaadError) {
    ctx.gates.staadExport = "BLOCKED";
  } else if (hasStaadWarning) {
    ctx.gates.staadExport = "PARTIALLY_READY";
  }

  // Logic for Quantity Gate
  if (ctx.gates.geometry === "BLOCKED") {
    ctx.gates.quantity = "BLOCKED";
  } else if (hasQuantityError) {
    ctx.gates.quantity = "BLOCKED";
  } else if (hasQuantityWarning) {
    ctx.gates.quantity = "PARTIALLY_READY";
  }

  // Logic for Project Save Gate
  // Currently, we don't block save based on engineering completeness.
  // It is always READY unless there is a catastrophic schema violation, which Zod catches earlier.
  ctx.gates.projectSave = "READY";

  const exportBlocked = ctx.gates.staadExport === "BLOCKED";

  return {
    id: ctx.runId,
    projectId: project.id,
    modelHash: computeAnalysisHash(project),
    exportBlocked,
    findings: ctx.findings,
    gates: ctx.gates,
    createdAt: new Date().toISOString(),
  };
}
