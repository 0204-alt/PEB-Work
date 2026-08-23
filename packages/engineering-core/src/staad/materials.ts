import { CanonicalProject } from "../types.js";
import { StaadContext } from "./types.js";

export function serializeMaterials(project: CanonicalProject, ctx: StaadContext) {
  if (project.materials.length === 0) return;

  // Output custom materials
  // E (MPa) to kN/m2 -> MPa is N/mm2 = MN/m2 = 1000 kN/m2
  
  // Sort materials by canonical ID for determinism
  const sortedMaterials = [...project.materials].sort((a, b) => a.id.localeCompare(b.id));

  for (const mat of sortedMaterials) {
    const e_kNpm2 = mat.E_MPa * 1000;
    const g_MPa = mat.E_MPa / (2 * (1 + mat.poisson));
    const g_kNpm2 = g_MPa * 1000;
    // density in kg/m3 -> kN/m3
    const den_kNpm3 = (mat.density_kgpm3 * 9.80665) / 1000.0;
    
    // We sanitize the material name for STAAD compatibility (no spaces, alpha numeric)
    const staadName = mat.name.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();

    ctx.lines.push(`DEFINE MATERIAL START`);
    ctx.lines.push(`ISOTROPIC ${staadName}`);
    ctx.lines.push(`E ${e_kNpm2.toFixed(3)}`);
    ctx.lines.push(`POISSON ${mat.poisson.toFixed(3)}`);
    ctx.lines.push(`DENSITY ${den_kNpm3.toFixed(4)}`);
    ctx.lines.push(`ALPHA 1.2e-05`); // Generic thermal expansion for steel
    ctx.lines.push(`DAMP 0.03`); // Generic damping
    ctx.lines.push(`TYPE STEEL`);
    ctx.lines.push(`STRENGTH FY ${mat.fy_MPa * 1000} FU ${mat.fu_MPa * 1000} RY 1.5 RT 1.2`);
    ctx.lines.push(`END DEFINE MATERIAL`);
  }

  // Now output CONSTANTS to assign materials to members
  const materialMap = new Map<string, number[]>(); // materialId -> staadMemberIds[]
  for (const member of project.structuralModel.members) {
    const staadId = ctx.memberMap.get(member.id);
    if (!staadId || !member.materialId) continue;
    
    let list = materialMap.get(member.materialId);
    if (!list) {
      list = [];
      materialMap.set(member.materialId, list);
    }
    list.push(staadId);
  }

  if (materialMap.size > 0) {
    ctx.lines.push("CONSTANTS");
    const sortedMatIds = Array.from(materialMap.keys()).sort();
    
    for (const matId of sortedMatIds) {
      const mat = project.materials.find(m => m.id === matId);
      if (!mat) {
        ctx.errors.push(`Material ${matId} not found.`);
        continue;
      }
      
      const staadName = mat.name.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
      const staadIds = materialMap.get(matId)!;
      staadIds.sort((a, b) => a - b);
      const memberListStr = staadIds.join(" ");
      
      ctx.lines.push(`MATERIAL ${staadName} MEMB ${memberListStr}`);
    }
  }
}
