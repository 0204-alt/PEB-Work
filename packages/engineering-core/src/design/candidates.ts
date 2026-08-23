import { Section, Material } from "../types.js";

export function generateCandidates(
  availableSections: Section[],
  availableMaterials: Material[],
  memberType: string
): { section: Section; material: Material }[] {
  // Deterministic ordering: prefer lightest sections that are appropriate
  // For preliminary PEB: BUILT_UP and TAPERED are typically used for primary frame.
  // We'll filter and sort by unitMass_kgpm ascending.
  
  const validSections = availableSections.filter(s => {
    // Primary frames are typically built-up or tapered I-sections.
    // If not specified, we take all.
    return true; 
  });
  
  validSections.sort((a, b) => a.unitMass_kgpm - b.unitMass_kgpm);

  const candidates: { section: Section; material: Material }[] = [];
  
  for (const s of validSections) {
    // Assign material. If section specifies material, use it, else default to first available.
    let mat = availableMaterials.find(m => m.id === s.materialId);
    if (!mat && availableMaterials.length > 0) {
      mat = availableMaterials[0];
    }
    if (mat) {
      candidates.push({ section: s, material: mat });
    }
  }

  return candidates;
}
