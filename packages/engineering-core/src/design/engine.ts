import {
  Member,
  Section,
  Material,
  DesignDemand,
  MemberDesignResult,
  CandidateEvaluation
} from "../types.js";
import { createId } from "../ids.js";
import { generateCandidates } from "./candidates.js";
import { checkAxialResistance } from "./axial.js";
import { checkBendingResistance } from "./bending.js";
import { checkShearResistance } from "./shear.js";
import { checkCombinedUtilization } from "./combined.js";
import { checkSlenderness } from "./slenderness.js";
import { checkServiceability } from "./serviceability.js";

export function designMember(
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
    let cSlenderness = 0;
    
    // Evaluate demands (we take worst case for now)
    for (const d of demands) {
      // Axial
      const axRes = checkAxialResistance(d.axial_kN, section, material, member.length_m);
      if (axRes.status === "FAIL") {
        candidateStatus = "FAIL";
        failureReason = failureReason || "Axial Check Failed";
        govCheck = "AXIAL";
      }
      if (axRes.utilization > maxUtil && axRes.utilization !== 999) maxUtil = axRes.utilization;
      cAxialRes = axRes.resistance_kN;

      // Slenderness
      const isComp = d.axial_kN < 0;
      const slendRes = checkSlenderness(section, member.length_m, isComp);
      if (slendRes.status === "FAIL") {
        candidateStatus = "FAIL";
        failureReason = failureReason || "Slenderness Exceeded";
        govCheck = "SLENDERNESS";
      }
      cSlenderness = slendRes.slenderness;

      // Bending
      const bendRes = checkBendingResistance(d.moment_kNm, section, material, "MAJOR");
      if (bendRes.status === "FAIL") {
        candidateStatus = "FAIL";
        failureReason = failureReason || "Bending Check Failed";
        govCheck = "BENDING";
      }
      if (bendRes.utilization > maxUtil && bendRes.utilization !== 999) maxUtil = bendRes.utilization;
      cBendingRes = bendRes.resistance_kNm;

      // Shear
      const shearRes = checkShearResistance(d.shear_kN, section, material);
      if (shearRes.status === "FAIL") {
        candidateStatus = "FAIL";
        failureReason = failureReason || "Shear Check Failed";
        govCheck = "SHEAR";
      }
      if (shearRes.utilization > maxUtil && shearRes.utilization !== 999) maxUtil = shearRes.utilization;
      cShearRes = shearRes.resistance_kN;

      // Combined
      const comb = checkCombinedUtilization(
        axRes.utilization === 999 ? 0 : axRes.utilization,
        bendRes.utilization === 999 ? 0 : bendRes.utilization
      );
      if (comb.status === "FAIL") {
        candidateStatus = "FAIL";
        failureReason = failureReason || "Combined Interaction Failed";
      }

      // Determine governing check based on max utilization
      const utils = [
        { name: "AXIAL", val: axRes.utilization },
        { name: "SLENDERNESS", val: slendRes.utilization },
        { name: "BENDING", val: bendRes.utilization },
        { name: "SHEAR", val: shearRes.utilization },
        { name: "COMBINED", val: comb.utilization },
      ];
      utils.sort((a, b) => b.val - a.val);
      // Filter out 999 which is the error code
      const validUtils = utils.filter(u => u.val !== 999);
      if (utils[0].val === 999 && candidateStatus === "FAIL") {
         govCheck = utils[0].name;
      } else if (validUtils.length > 0 && validUtils[0].val > maxUtil) {
        maxUtil = validUtils[0].val;
        if (candidateStatus === "FAIL") {
           govCheck = validUtils[0].name;
        }
      }
      
      if (candidateStatus === "PASS") {
         finalAxialDemand = d.axial_kN;
         finalBendingDemand = d.moment_kNm;
         finalShearDemand = d.shear_kN;
         govLoadCase = d.loadCaseId;
      }
    }

    // Serviceability check
    const serv = checkServiceability(member.type, member.length_m);
    // Not failing preliminary candidates due to lack of analysis result
    
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

    if (candidateStatus === "PASS" && !selectedCandidate) {
      selectedCandidate = { section, material };
      finalStatus = "PASS";
      finalAxialRes = cAxialRes;
      finalBendingRes = cBendingRes;
      finalShearRes = cShearRes;
      finalSlenderness = cSlenderness;
      finalUtil = maxUtil;
      break; // Pick the first (lightest) passing candidate
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
