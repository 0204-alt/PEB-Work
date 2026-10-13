import { ValidatorFunc, addFinding } from "../types.js";

export const validateMaterials: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  for (const material of project.materials) {
    if (material.density_kgpm3 <= 0) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "MATERIALS",
        entityType: "MATERIAL",
        entityId: material.id,
        code: "INVALID_DENSITY",
        message: `Material ${material.name} has invalid density.`,
        blocking: true,
      });
    }

    if (material.fy_MPa <= 0 || material.fu_MPa <= 0) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "MATERIALS",
        entityType: "MATERIAL",
        entityId: material.id,
        code: "INVALID_STRENGTH",
        message: `Material ${material.name} has invalid yield/ultimate strength.`,
        blocking: true,
      });
    }

    if (material.E_MPa <= 0 || material.poisson <= 0 || material.poisson > 0.5) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "MATERIALS",
        entityType: "MATERIAL",
        entityId: material.id,
        code: "INVALID_ELASTIC_PROPERTIES",
        message: `Material ${material.name} has invalid elastic properties.`,
        blocking: true,
      });
    }

    if (!material.source) {
      addFinding(ctx, {
        severity: "WARNING",
        category: "MATERIALS",
        entityType: "MATERIAL",
        entityId: material.id,
        code: "MISSING_PROVENANCE",
        message: `Material ${material.name} lacks traceability/source.`,
      });
    }
  }
};
