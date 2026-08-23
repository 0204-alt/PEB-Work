import { CanonicalProject } from "../types.js";
import { StaadContext } from "./types.js";

export function serializeSupports(project: CanonicalProject, ctx: StaadContext) {
  if (project.structuralModel.supports.length === 0) return;

  const supportLines: string[] = [];
  
  // Group by type to optimize STAAD input
  const pinnedNodes: number[] = [];
  const fixedNodes: number[] = [];
  // Fixed but (custom) not fully mapped since reference is absent, we explicitly fail it.

  // Sort supports by canonical ID
  const sortedSupports = [...project.structuralModel.supports].sort((a, b) => a.id.localeCompare(b.id));

  for (const sup of sortedSupports) {
    const staadNodeId = ctx.nodeMap.get(sup.nodeId);
    if (!staadNodeId) continue;
    
    if (sup.type === "PINNED") {
      pinnedNodes.push(staadNodeId);
    } else if (sup.type === "FIXED") {
      fixedNodes.push(staadNodeId);
    } else {
      ctx.errors.push(`Support type ${sup.type} on node ${sup.nodeId} is UNSUPPORTED.`);
    }
  }

  if (pinnedNodes.length > 0 || fixedNodes.length > 0) {
    supportLines.push("SUPPORTS");
    
    if (pinnedNodes.length > 0) {
      pinnedNodes.sort((a, b) => a - b);
      supportLines.push(`${pinnedNodes.join(" ")} PINNED`);
    }
    
    if (fixedNodes.length > 0) {
      fixedNodes.sort((a, b) => a - b);
      supportLines.push(`${fixedNodes.join(" ")} FIXED`);
    }
    
    ctx.lines.push(...supportLines);
  }
}
