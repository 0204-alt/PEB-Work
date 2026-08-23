import { CanonicalProject, Section } from "../types.js";
import { StaadContext } from "./types.js";
import { mmToMeters } from "./units.js";

export function serializeProperties(project: CanonicalProject, ctx: StaadContext) {
  const propertyLines: string[] = [];

  // Group members by section ID
  const sectionMap = new Map<string, number[]>(); // sectionId -> staadMemberIds[]
  
  for (const member of project.structuralModel.members) {
    const staadId = ctx.memberMap.get(member.id);
    if (!staadId || !member.sectionId) continue;
    
    let list = sectionMap.get(member.sectionId);
    if (!list) {
      list = [];
      sectionMap.set(member.sectionId, list);
    }
    list.push(staadId);
  }

  if (sectionMap.size > 0) {
    propertyLines.push("MEMBER PROPERTY");
    
    // Sort section IDs to ensure determinism
    const sortedSectionIds = Array.from(sectionMap.keys()).sort();

    for (const sectionId of sortedSectionIds) {
      const staadIds = sectionMap.get(sectionId)!;
      // Sort member IDs
      staadIds.sort((a, b) => a - b);
      const memberListStr = formatNumberList(staadIds);
      
      const section = project.sections.find(s => s.id === sectionId);
      if (!section) {
        ctx.errors.push(`Section ${sectionId} not found in project sections.`);
        continue;
      }
      
      const propStr = getStaadPropertyString(section, ctx);
      if (propStr) {
        propertyLines.push(`${memberListStr} ${propStr}`);
      }
    }
  }

  if (propertyLines.length > 1) { // More than just "MEMBER PROPERTY"
    ctx.lines.push(...propertyLines);
  }
}

function getStaadPropertyString(section: Section, ctx: StaadContext): string | null {
  if (!section.geometryConfig) {
    ctx.warnings.push(`Section ${section.designation} lacks geometryConfig; assuming PRISMATIC generic.`);
    const ax = mmToMeters(mmToMeters(section.area_mm2 || 0)); // mm2 to m2
    const ix = (section.Ix_mm4 || 0) / 1e12; // mm4 to m4
    const iy = (section.Iy_mm4 || 0) / 1e12;
    // Without full parameters, it's safer to flag
    if (ax === 0 || ix === 0 || iy === 0) {
      ctx.errors.push(`Section ${section.designation} has 0 properties and no config. UNSUPPORTED_SECTION`);
      return null;
    }
    return `PRISMATIC AX ${ax.toFixed(6)} IX ${ix.toFixed(8)} IY ${iy.toFixed(8)}`;
  }

  if (section.geometryConfig.type === "BUILT_UP") {
    // Standard I-section
    const d = mmToMeters(section.geometryConfig.depth_mm);
    const tw = mmToMeters(section.geometryConfig.webThickness_mm);
    const bf = mmToMeters(section.geometryConfig.topFlangeWidth_mm); // Assumes symmetric for now
    const tf = mmToMeters(section.geometryConfig.topFlangeThickness_mm);
    
    return `PRISMATIC YD ${d.toFixed(4)} ZD ${bf.toFixed(4)} YB ${tw.toFixed(4)} ZB ${tf.toFixed(4)}`;
  }

  if (section.geometryConfig.type === "TAPERED") {
    // STAAD allows MEMBER PROPERTY TAPERED but requires exact syntax that might vary. 
    // Since Design model 2.STD is absent, we explicitly mark tapered as unsupported.
    ctx.errors.push(`Tapered section ${section.designation} is UNSUPPORTED_SECTION (syntax unverified).`);
    return null;
  }

  if (section.geometryConfig.type === "ROLLED") {
    // Could use "TABLE ST" if we had catalog mappings, but for now we fallback to generic prismatic
    // if area/inertia are defined
    ctx.warnings.push(`Rolled section ${section.designation} exported as PRISMATIC (generic) due to missing catalog mapping evidence.`);
    const ax = (section.area_mm2 || 0) / 1e6;
    const ix = (section.Ix_mm4 || 0) / 1e12;
    const iy = (section.Iy_mm4 || 0) / 1e12;
    if (ax === 0 || ix === 0 || iy === 0) {
      ctx.errors.push(`Rolled section ${section.designation} has 0 properties. UNSUPPORTED_SECTION`);
      return null;
    }
    return `PRISMATIC AX ${ax.toFixed(6)} IX ${ix.toFixed(8)} IY ${iy.toFixed(8)}`;
  }

  ctx.errors.push(`Section ${section.designation} of type ${(section.geometryConfig as any).type} is UNSUPPORTED_SECTION.`);
  return null;
}

function formatNumberList(nums: number[]): string {
  // Simple space separated list for now. e.g. "1 2 3 4"
  return nums.join(" ");
}
