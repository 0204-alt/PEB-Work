import { CanonicalProject } from "../types.js";
import { StaadContext } from "./types.js";

export function serializeCombinations(project: CanonicalProject, ctx: StaadContext) {
  if (project.loadCombinations.length === 0) return;

  const sortedCombs = [...project.loadCombinations].sort((a, b) => a.id.localeCompare(b.id));

  for (const comb of sortedCombs) {
    // If combinations reference crane cases and crane is OFF, we must omit the crane cases 
    // or block the combination if it's completely empty.
    
    let combId = ctx.nextLoadCaseId++;
    const safeTitle = comb.label.replace(/[\r\n]+/g, " ").substring(0, 50);
    
    let factorStr = "";
    let validFactors = 0;
    
    for (const factor of comb.factors) {
      const staadLcId = ctx.loadCaseMap.get(factor.loadCaseId);
      if (!staadLcId) {
        // This could happen if load case was a Crane case and was skipped
        continue;
      }
      factorStr += `${staadLcId} ${factor.factor.toFixed(3)} `;
      validFactors++;
    }

    if (validFactors === 0) {
      ctx.warnings.push(`Load combination ${comb.label} has no valid load cases remaining (possibly due to Crane OFF). Omitted.`);
      continue;
    }

    ctx.lines.push(`LOAD COMBINATION ${combId} ${safeTitle}`);
    ctx.lines.push(factorStr.trim());
  }
}
