import { ValidatorFunc, addFinding } from "../types.js";

export const validateCrane: ValidatorFunc = (ctx) => {
  const { project } = ctx;
  const config = project.geometry.craneConfig;

  const craneMembers = project.structuralModel.members.filter(m => m.type === "CRANE_RUNWAY" || m.type === "CRANE_COLUMN");
  const craneLoads = project.loadCases.filter(lc => lc.type === "CRANE");

  if (!config || !config.craneEnabled) {
    if (craneMembers.length > 0) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "CRANE",
        code: "ORPHAN_CRANE_MEMBERS",
        message: `Crane is disabled, but crane members exist in the structural model.`,
        blocking: true,
      });
    }
    if (craneLoads.length > 0) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "CRANE",
        code: "ORPHAN_CRANE_LOADS",
        message: `Crane is disabled, but crane load cases exist.`,
        blocking: true,
      });
    }
    return;
  }

  // Crane is enabled
  if (config.capacity_t === undefined || config.capacity_t <= 0) {
    addFinding(ctx, {
      severity: "ERROR",
      category: "CRANE",
      code: "INVALID_CAPACITY",
      message: `Crane is enabled but lacks valid capacity.`,
      blocking: true,
    });
  }

  if (config.craneSelfWeight_kN === undefined || config.craneSelfWeight_kN <= 0) {
    addFinding(ctx, {
      severity: "WARNING",
      category: "CRANE",
      code: "MISSING_SELF_WEIGHT",
      message: `Crane is enabled but lacks valid self-weight.`,
    });
  }

  if (config.verticalImpactMethodology && !config.verticalImpactMethodology.verified) {
    addFinding(ctx, {
      severity: "REQUIRES_ENGINEERING_REVIEW",
      category: "CRANE",
      code: "UNVERIFIED_METHODOLOGY",
      message: `Crane vertical impact methodology is not verified.`,
    });
  }
};
