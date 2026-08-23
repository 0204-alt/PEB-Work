import type { CanonicalProject } from "../types.js";

export interface AnalysisValidationResult {
  hasErrors: boolean;
  errors: string[];
  warnings: string[];
}

export function validateAnalysisModel(project: CanonicalProject): AnalysisValidationResult {
  const result: AnalysisValidationResult = {
    hasErrors: false,
    errors: [],
    warnings: [],
  };

  const { nodes, members, supports } = project.structuralModel;

  if (nodes.length === 0) {
    result.errors.push("Model has no nodes.");
    result.hasErrors = true;
  }

  if (members.length === 0) {
    result.errors.push("Model has no members.");
    result.hasErrors = true;
  }

  if (supports.length === 0) {
    result.errors.push("Model has no supports.");
    result.hasErrors = true;
  }

  // Check for duplicate nodes
  const nodeCoords = new Set<string>();
  for (const n of nodes) {
    const key = `${n.x_m.toFixed(4)},${n.y_m.toFixed(4)},${n.z_m.toFixed(4)}`;
    if (nodeCoords.has(key)) {
      result.errors.push(`Duplicate node found at coordinates: ${key}`);
      result.hasErrors = true;
    }
    nodeCoords.add(key);
  }

  // Check members
  for (const m of members) {
    if (!m.sectionId && !m.metadata?.isRigidLink) {
      result.errors.push(`Member ${m.id} (${m.label}) has no section assigned.`);
      result.hasErrors = true;
    }
    if (!m.materialId && !m.metadata?.isRigidLink) {
      result.errors.push(`Member ${m.id} (${m.label}) has no material assigned.`);
      result.hasErrors = true;
    }
    if (m.startNodeId === m.endNodeId) {
      result.errors.push(`Member ${m.id} (${m.label}) has zero length (start and end nodes are identical).`);
      result.hasErrors = true;
    }
  }

  // Missing load cases
  if (project.loadCases.length === 0) {
    result.warnings.push("Model has no load cases defined.");
  }

  return result;
}
