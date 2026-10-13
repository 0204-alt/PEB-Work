import { ValidatorFunc, addFinding } from "../types.js";

export const validateProvenance: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  for (const material of project.materials) {
    if (!material.source) {
      addFinding(ctx, {
        severity: "REQUIRES_ENGINEERING_REVIEW",
        category: "PROVENANCE",
        entityType: "MATERIAL",
        entityId: material.id,
        code: "MISSING_MATERIAL_SOURCE",
        message: `Material ${material.name} has no provenance source.`,
      });
    }
  }

  for (const lc of project.loadCases) {
    if (!lc.source) {
       addFinding(ctx, {
        severity: "WARNING",
        category: "PROVENANCE",
        entityType: "LOAD_CASE",
        entityId: lc.id,
        code: "MISSING_LOAD_SOURCE",
        message: `Load case ${lc.type} has no provenance source.`,
      });
    }
  }
};
