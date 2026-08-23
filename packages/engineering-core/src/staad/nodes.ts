import { CanonicalProject } from "../types.js";
import { StaadContext } from "./types.js";
import { formatCoord } from "./units.js";

export function serializeNodes(project: CanonicalProject, ctx: StaadContext) {
  if (project.structuralModel.nodes.length === 0) return;

  ctx.lines.push("JOINT COORDINATES");
  
  // Sort nodes by canonical ID to ensure determinism
  const sortedNodes = [...project.structuralModel.nodes].sort((a, b) => a.id.localeCompare(b.id));

  for (const node of sortedNodes) {
    const staadId = ctx.nextNodeId++;
    ctx.nodeMap.set(node.id, staadId);
    
    // Explicit conversion (internal already in meters)
    const x = formatCoord(node.x_m);
    const y = formatCoord(node.y_m);
    const z = formatCoord(node.z_m);
    
    ctx.lines.push(`${staadId} ${x} ${y} ${z}`);
  }
}
