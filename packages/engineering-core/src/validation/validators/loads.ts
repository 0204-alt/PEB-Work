import { ValidatorFunc, addFinding } from "../types.js";

export const validateLoads: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  const validLoadCases = new Set(project.loadCases.map(lc => lc.id));
  const validNodes = new Set(project.structuralModel.nodes.map(n => n.id));
  const validMembers = new Set(project.structuralModel.members.map(m => m.id));

  // Check self-weight double counting
  let selfWeightCount = 0;
  for (const lc of project.loadCases) {
    if (lc.type === "DEAD" && lc.description.toLowerCase().includes("self weight")) {
      selfWeightCount++;
    }
    
    for (const app of lc.applications) {
      if (app.description.toLowerCase().includes("self weight")) {
        selfWeightCount++;
      }
      
      if (!isFinite(app.magnitude)) {
        addFinding(ctx, {
          severity: "ERROR",
          category: "LOADS",
          entityType: "LOAD_APPLICATION",
          entityId: app.id,
          code: "INVALID_MAGNITUDE",
          message: `Load application has non-finite magnitude.`,
          blocking: true,
        });
      }

      if (app.targetType === "NODE" && !validNodes.has(app.targetId)) {
        addFinding(ctx, {
          severity: "ERROR",
          category: "LOADS",
          entityType: "LOAD_APPLICATION",
          entityId: app.id,
          code: "INVALID_TARGET_NODE",
          message: `Load application references missing node ${app.targetId}.`,
          blocking: true,
        });
      }

      if (app.targetType === "MEMBER" && !validMembers.has(app.targetId)) {
        addFinding(ctx, {
          severity: "ERROR",
          category: "LOADS",
          entityType: "LOAD_APPLICATION",
          entityId: app.id,
          code: "INVALID_TARGET_MEMBER",
          message: `Load application references missing member ${app.targetId}.`,
          blocking: true,
        });
      }
    }
  }

  if (selfWeightCount > 1) {
    addFinding(ctx, {
      severity: "ERROR",
      category: "LOADS",
      code: "SELF_WEIGHT_DOUBLE_COUNTING",
      message: `Multiple physical self-weight applications detected.`,
      blocking: true,
    });
  }

  // Load Combinations
  for (const combo of project.loadCombinations) {
    for (const factor of combo.factors) {
      if (!validLoadCases.has(factor.loadCaseId)) {
        addFinding(ctx, {
          severity: "ERROR",
          category: "COMBINATIONS",
          entityType: "LOAD_COMBINATION",
          entityId: combo.id,
          code: "INVALID_LOAD_CASE_REF",
          message: `Combination references missing load case ${factor.loadCaseId}.`,
          blocking: true,
        });
      }
    }
  }
};
