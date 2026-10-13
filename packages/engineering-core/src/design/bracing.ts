import { createId } from "../ids.js";
import type {
  Member,
  Section,
  Material,
  DesignDemand,
  MemberDesignResult,
  CandidateEvaluation
} from "../types.js";
import { checkAxialResistance } from "./axial.js";
import { checkSlenderness } from "./slenderness.js";

export function designBracingMember(
  member: Member,
  designRunId: string,
  availableSections: Section[],
  availableMaterials: Material[]
): MemberDesignResult {
  // Phase 7: Global structural analysis is deferred to Phase 10.
  // There is no realistic demand to design against at this stage.
  // We simply match the member's configured section (if any) or pick a generic section.
  // The status MUST be REQUIRES_ENGINEERING_REVIEW because there is no analysis demand.

  let selectedSection = availableSections.find(s => s.id === member.sectionId);
  if (!selectedSection && availableSections.length > 0) {
    // If no section is explicitly defined, just pick the first applicable one
    // In a real scenario, this would filter by ROD/PIPE/ANGLE depending on config
    selectedSection = availableSections[0];
  }

  let selectedMaterial = availableMaterials.find(m => m.id === member.materialId);
  if (!selectedMaterial && availableMaterials.length > 0) {
    selectedMaterial = availableMaterials[0];
  }

  const evaluations: CandidateEvaluation[] = [];

  if (selectedSection) {
    evaluations.push({
      id: createId(),
      memberDesignResultId: "", // Assigned later in DB
      sectionId: selectedSection.id,
      status: "REQUIRES_ENGINEERING_REVIEW",
      governingCheck: "GLOBAL_ANALYSIS_MISSING",
      utilization: null,
      failureReason: "Global structural analysis demands are unavailable until Phase 10.",
      rank: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  const res: MemberDesignResult = {
    id: createId(),
    designRunId,
    memberId: member.id,
    sectionId: selectedSection?.id,
    materialId: selectedMaterial?.id,
    governingLoadCaseId: null,
    axialDemand: null,
    axialResistance: null, // Depending on tension/compression
    bendingDemand: null,
    bendingResistance: null,
    shearDemand: null,
    shearResistance: null,
    utilization: null,
    slenderness: null,
    status: "REQUIRES_ENGINEERING_REVIEW",
    warnings: {
      message: "Global structural analysis demands are unavailable until Phase 10."
    },
    evaluations,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return res;
}
