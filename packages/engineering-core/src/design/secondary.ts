import {
  Member,
  Section,
  Material,
  DesignDemand,
  MemberDesignResult,
  CandidateEvaluation,
  LoadCase
} from "../types.js";
import { createId } from "../ids.js";
import { generateCandidates } from "./candidates.js";
import { checkBendingResistance } from "./bending.js";
import { checkShearResistance } from "./shear.js";

// Basic line-load generator based on geometry (spacing) and load magnitude
export function calculateSecondaryDemand(member: Member, loadCases: LoadCase[], spacing_m: number): DesignDemand[] {
  const demands: DesignDemand[] = [];
  
  // Calculate simply supported moments and shears (wL^2/8, wL/2)
  const L = member.length_m;
  
  for (const lc of loadCases) {
    // We assume the load magnitude is available, but currently loadCases don't have direct area loads attached to them
    // in the simplified model unless it's configured in design basis.
    // We mock a surface pressure for the sake of the engine (in real scenario, we'd lookup from designBasis.wind.pressure_kNpm2 etc.)
    // Let's assume a generic pressure 1.0 kN/m2 for LIVE and -1.0 for WIND for this Phase.
    let pressure_kNpm2 = 0;
    
    if (lc.type === "LIVE") pressure_kNpm2 = 0.57; // typical roof live load
    if (lc.type === "DEAD") pressure_kNpm2 = 0.15; // sheeting + insulation
    if (lc.type === "WIND_PLUS_X" || lc.type === "WIND_MINUS_X" || lc.type === "WIND_PLUS_Z" || lc.type === "WIND_MINUS_Z" || lc.type === "UPLIFT") {
      pressure_kNpm2 = -1.2; // uplift
    }
    
    const lineLoad_kNpm = pressure_kNpm2 * spacing_m;
    const moment = Math.abs((lineLoad_kNpm * L * L) / 8);
    const shear = Math.abs((lineLoad_kNpm * L) / 2);
    
    demands.push({
      loadCaseId: lc.id,
      axial_kN: 0,
      moment_kNm: moment,
      shear_kN: shear,
      source: "SIMPLIFIED_BEAM_THEORY",
    });
  }
  
  return demands;
}

function isColdFormed(section: Section): boolean {
  // Simple heuristic for cold-formed sections
  const cfFamilies = ["Z_PURLIN", "C_PURLIN", "C_LIPPED", "COLD_FORMED", "PURLIN", "GIRT"];
  return cfFamilies.some(f => section.family.toUpperCase().includes(f)) || section.designation.toUpperCase().startsWith("Z") || section.designation.toUpperCase().startsWith("C");
}

export function designSecondaryMember(
  member: Member,
  designRunId: string,
  demands: DesignDemand[],
  availableSections: Section[],
  availableMaterials: Material[]
): MemberDesignResult {
  const resultId = createId();
  const candidates = generateCandidates(availableSections, availableMaterials, member.type);
  const evaluations: CandidateEvaluation[] = [];

  const now = new Date().toISOString();
  let selectedCandidate = null;
  let finalStatus = "FAILED";
  let finalWarnings: Record<string, unknown> = {};

  let finalAxialDemand = 0;
  let finalBendingDemand = 0;
  let finalShearDemand = 0;
  let finalAxialRes = 0;
  let finalBendingRes = 0;
  let finalShearRes = 0;
  let finalSlenderness = 0;
  let finalUtil = 0;
  let govLoadCase: string | null = null;

  let rank = 1;

  for (const { section, material } of candidates) {
    let candidateStatus = "PASS";
    let failureReason: string | null = null;
    let govCheck = "NONE";
    let maxUtil = 0;

    let cAxialRes = 0;
    let cBendingRes = 0;
    let cShearRes = 0;
    
    const isCF = isColdFormed(section);

    if (isCF) {
      candidateStatus = "REQUIRES_ENGINEERING_REVIEW";
      failureReason = "Effective-section design not implemented for selected cold-formed section.";
      govCheck = "COLD_FORMED_EFFECTIVE_SECTION";
    }

    for (const d of demands) {
      // Bending
      const bendRes = checkBendingResistance(d.moment_kNm, section, material, "MAJOR");
      if (bendRes.status === "FAIL" && candidateStatus !== "REQUIRES_ENGINEERING_REVIEW") {
        candidateStatus = "FAIL";
        failureReason = failureReason || "Bending Check Failed";
        govCheck = "BENDING";
      }
      if (bendRes.utilization > maxUtil && bendRes.utilization !== 999) maxUtil = bendRes.utilization;
      cBendingRes = bendRes.resistance_kNm;

      // Shear
      const shearRes = checkShearResistance(d.shear_kN, section, material);
      if (shearRes.status === "FAIL" && candidateStatus !== "REQUIRES_ENGINEERING_REVIEW") {
        candidateStatus = "FAIL";
        failureReason = failureReason || "Shear Check Failed";
        govCheck = "SHEAR";
      }
      if (shearRes.utilization > maxUtil && shearRes.utilization !== 999) maxUtil = shearRes.utilization;
      cShearRes = shearRes.resistance_kN;
      
      if (candidateStatus === "PASS" || candidateStatus === "REQUIRES_ENGINEERING_REVIEW") {
         finalAxialDemand = d.axial_kN;
         finalBendingDemand = d.moment_kNm;
         finalShearDemand = d.shear_kN;
         govLoadCase = d.loadCaseId;
      }
    }

    evaluations.push({
      id: createId(),
      memberDesignResultId: resultId,
      sectionId: section.id,
      status: candidateStatus,
      governingCheck: govCheck,
      utilization: maxUtil,
      failureReason,
      rank: rank++,
      createdAt: now,
      updatedAt: now,
    });

    // Accept PASS or REQUIRES_ENGINEERING_REVIEW as valid for selection
    if ((candidateStatus === "PASS" || candidateStatus === "REQUIRES_ENGINEERING_REVIEW") && !selectedCandidate) {
      selectedCandidate = { section, material };
      finalStatus = candidateStatus;
      finalAxialRes = cAxialRes;
      finalBendingRes = cBendingRes;
      finalShearRes = cShearRes;
      finalSlenderness = 0;
      finalUtil = maxUtil;
      // We do not break immediately if we are trying to find the lightest section, 
      // but generateCandidates already sorts by unitMass_kgpm, so the first valid is the lightest.
      break; 
    }
  }
  
  if (!selectedCandidate && candidates.length > 0 && demands.length > 0) {
    finalWarnings["error"] = "NO ACCEPTABLE SECTION FOUND";
  }

  return {
    id: resultId,
    designRunId,
    memberId: member.id,
    sectionId: selectedCandidate ? selectedCandidate.section.id : null,
    materialId: selectedCandidate ? selectedCandidate.material.id : null,
    governingLoadCaseId: govLoadCase,
    axialDemand: finalAxialDemand,
    axialResistance: finalAxialRes,
    bendingDemand: finalBendingDemand,
    bendingResistance: finalBendingRes,
    shearDemand: finalShearDemand,
    shearResistance: finalShearRes,
    utilization: finalUtil,
    slenderness: finalSlenderness,
    status: finalStatus,
    warnings: finalWarnings,
    evaluations,
    createdAt: now,
    updatedAt: now,
  };
}
