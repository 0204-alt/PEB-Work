import { CanonicalProject } from "../types.js";
import { StaadContext } from "./types.js";

export function preValidateStaadExport(project: CanonicalProject, ctx: StaadContext) {
  if (project.structuralModel.nodes.length === 0) {
    ctx.errors.push("No nodes present in canonical model.");
  }
  if (project.structuralModel.members.length === 0) {
    ctx.errors.push("No members present in canonical model.");
  }

  // Check for duplicate nodes conceptually
  const coords = new Set<string>();
  for (const n of project.structuralModel.nodes) {
    const key = `${n.x_m.toFixed(4)},${n.y_m.toFixed(4)},${n.z_m.toFixed(4)}`;
    if (coords.has(key)) {
      ctx.errors.push(`Duplicate node coords detected: ${key}`);
    }
    coords.add(key);
  }

  // Check for zero length members
  for (const m of project.structuralModel.members) {
    if (m.length_m === 0) {
      ctx.errors.push(`Member ${m.id} has zero length.`);
    }
    if (m.startNodeId === m.endNodeId) {
      ctx.errors.push(`Member ${m.id} starts and ends at the same node.`);
    }
  }
}

export function postValidateStaadExport(ctx: StaadContext) {
  if (ctx.errors.length > 0) {
    ctx.warnings.push("EXPORT_BLOCKED due to critical errors.");
  }
}
