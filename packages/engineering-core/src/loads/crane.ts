import { createId } from "../ids.js";
import type {
  Geometry,
  Node,
  Member,
  CraneConfig,
  LoadCase,
  LoadApplication,
} from "../types.js";

export function generateCraneLoads(
  craneConfig: CraneConfig,
  geometry: Geometry,
  nodes: Node[],
  members: Member[]
): LoadCase[] {
  const loadCases: LoadCase[] = [];
  
  if (!craneConfig.craneEnabled) return loadCases;
  if (!craneConfig.craneId) return loadCases;

  const hasRequiredCapacity =
    craneConfig.capacity_t !== undefined &&
    craneConfig.craneSelfWeight_kN !== undefined &&
    craneConfig.trolleyWeight_kN !== undefined &&
    craneConfig.craneSpan_m !== undefined &&
    craneConfig.numberOfWheels !== undefined &&
    craneConfig.numberOfWheels > 0;

  // Track if we have explicit position data (not currently in schema, so we fail this check by design to force review)
  // According to rule 3, if missing wheel-load distribution info -> REQUIRES_ENGINEERING_REVIEW.
  const hasWheelDistributionInfo = false; // Intentionally false until fully supported by inputs
  
  let P_max = 0;
  let status: "VALIDATED_INTERNAL" | "REQUIRES_ENGINEERING_REVIEW" | "PRELIMINARY" = "VALIDATED_INTERNAL";
  
  if (hasRequiredCapacity && hasWheelDistributionInfo) {
    // In future: calculate max based on exact load position
    // ...
  } else {
    status = "REQUIRES_ENGINEERING_REVIEW";
    // We can compute a preliminary static assumption just to have loads in the model if capacity is known,
    // but the status remains REQUIRES_ENGINEERING_REVIEW
    if (hasRequiredCapacity) {
      const W_c = craneConfig.craneSelfWeight_kN!;
      const W_t = craneConfig.trolleyWeight_kN!;
      const W_l = craneConfig.capacity_t! * 9.81; // t to kN
      const wheelsPerSide = craneConfig.numberOfWheels! / 2;
      
      const minApproach_m = 1.0; 
      const L = craneConfig.craneSpan_m!;
      const maxReaction = (W_l + W_t) * ((L - minApproach_m) / L) + (W_c / 2);
      P_max = maxReaction / wheelsPerSide;
    }
  }

  // Create CRANE load case
  const craneCaseId = createId();
  const craneLoadCase: LoadCase = {
    id: craneCaseId,
    projectId: geometry.projectId,
    type: "CRANE",
    description: `Crane Loads - ${craneConfig.craneId}`,
    source: craneConfig.supplierDataAvailable ? "Supplier Data" : "Preliminary Assumption",
    designBasisId: geometry.projectId, // Using project ID as stub for design basis reference
    status,
    applications: [],
    metadata: { generatedBy: "CRANE_SYSTEM", craneId: craneConfig.craneId },
  };

  // Find crane runway nodes to apply loads
  const runwayNodes = nodes.filter(
    (n) => n.role === "CRANE_SUPPORT" && (n.metadata as any)?.craneId === craneConfig.craneId
  );

  for (const node of runwayNodes) {
    // Vertical Load
    let verticalLoad = P_max;
    let verticalSource = "Preliminary Static Formula";
    let verticalStandard = "None";

    if (craneConfig.verticalImpactMethodology) {
      if (craneConfig.verticalImpactMethodology.verified) {
        verticalLoad = P_max * (1 + craneConfig.verticalImpactMethodology.value);
        verticalSource = craneConfig.verticalImpactMethodology.source;
        verticalStandard = craneConfig.verticalImpactMethodology.standard;
      } else {
        status = "REQUIRES_ENGINEERING_REVIEW";
        verticalSource = craneConfig.verticalImpactMethodology.source + " (Unverified)";
        verticalStandard = craneConfig.verticalImpactMethodology.standard;
      }
    } else {
       status = "REQUIRES_ENGINEERING_REVIEW";
    }
    
    if (verticalLoad > 0) {
      craneLoadCase.applications.push({
        id: createId(),
        loadCaseId: craneCaseId,
        targetType: "NODE",
        targetId: node.id,
        magnitude: -verticalLoad,
        direction: "GY",
        units: "kN",
        source: verticalSource,
        designBasisRef: verticalStandard,
        description: "Max Vertical Wheel Load w/ Impact",
        metadata: { generatedBy: "CRANE_SYSTEM", craneId: craneConfig.craneId },
      });
    }

    // Transverse
    if (craneConfig.transverseMethodology) {
      if (craneConfig.transverseMethodology.verified && craneConfig.capacity_t && craneConfig.trolleyWeight_kN && craneConfig.numberOfWheels) {
        const W_l = craneConfig.capacity_t * 9.81;
        const W_t = craneConfig.trolleyWeight_kN;
        const totalTransverse = (W_l + W_t) * craneConfig.transverseMethodology.value;
        const transversePerWheel = totalTransverse / craneConfig.numberOfWheels;
        
        craneLoadCase.applications.push({
          id: createId(),
          loadCaseId: craneCaseId,
          targetType: "NODE",
          targetId: node.id,
          magnitude: transversePerWheel,
          direction: "GX", 
          units: "kN",
          source: craneConfig.transverseMethodology.source,
          designBasisRef: craneConfig.transverseMethodology.standard,
          description: "Transverse Force",
          metadata: { generatedBy: "CRANE_SYSTEM", craneId: craneConfig.craneId },
        });
      } else {
        status = "REQUIRES_ENGINEERING_REVIEW";
      }
    } else {
       status = "REQUIRES_ENGINEERING_REVIEW";
    }

    // Longitudinal
    if (craneConfig.longitudinalMethodology) {
      if (craneConfig.longitudinalMethodology.verified && P_max > 0) {
        const longitudinalPerWheel = P_max * craneConfig.longitudinalMethodology.value;
        
        craneLoadCase.applications.push({
          id: createId(),
          loadCaseId: craneCaseId,
          targetType: "NODE",
          targetId: node.id,
          magnitude: longitudinalPerWheel,
          direction: "GZ",
          units: "kN",
          source: craneConfig.longitudinalMethodology.source,
          designBasisRef: craneConfig.longitudinalMethodology.standard,
          description: "Longitudinal Force",
          metadata: { generatedBy: "CRANE_SYSTEM", craneId: craneConfig.craneId },
        });
      } else {
        status = "REQUIRES_ENGINEERING_REVIEW";
      }
    } else {
       status = "REQUIRES_ENGINEERING_REVIEW";
    }
  }

  // Only push if there are applications
  if (craneLoadCase.applications.length > 0) {
    craneLoadCase.status = status;
    loadCases.push(craneLoadCase);
  }

  return loadCases;
}
