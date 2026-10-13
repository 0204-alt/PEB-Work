import { ValidatorFunc, addFinding } from "../types.js";

export const validateSections: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  for (const section of project.sections) {
    if (section.unitMass_kgpm === undefined || section.unitMass_kgpm <= 0) {
      addFinding(ctx, {
        severity: "ERROR",
        category: "SECTIONS",
        entityType: "SECTION",
        entityId: section.id,
        code: "INVALID_UNIT_MASS",
        message: `Section ${section.designation} has invalid unit mass.`,
        blocking: true,
      });
    }

    if (section.area_mm2 === undefined || section.area_mm2 <= 0) {
      addFinding(ctx, {
        severity: "WARNING",
        category: "SECTIONS",
        entityType: "SECTION",
        entityId: section.id,
        code: "MISSING_AREA",
        message: `Section ${section.designation} is missing cross-sectional area.`,
      });
    }

    if (!section.geometryConfig) {
      addFinding(ctx, {
        severity: "UNSUPPORTED",
        category: "SECTIONS",
        entityType: "SECTION",
        entityId: section.id,
        code: "MISSING_GEOMETRY_CONFIG",
        message: `Section ${section.designation} is missing geometry configuration.`,
        blocking: true,
      });
    }
  }
};
