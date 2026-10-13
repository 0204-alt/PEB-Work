import { ValidatorFunc, addFinding } from "../types.js";

export const validateBracing: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  for (const member of project.structuralModel.members) {
    if (member.type === "ROOF_BRACING" || member.type === "WALL_BRACING") {
      if (!member.sectionId) {
        addFinding(ctx, {
          severity: "ERROR",
          category: "BRACING",
          entityType: "MEMBER",
          entityId: member.id,
          code: "MISSING_BRACING_SECTION",
          message: `Bracing member ${member.label} is missing a section assignment.`,
          blocking: true,
        });
      }
      if (!member.materialId) {
        addFinding(ctx, {
          severity: "ERROR",
          category: "BRACING",
          entityType: "MEMBER",
          entityId: member.id,
          code: "MISSING_BRACING_MATERIAL",
          message: `Bracing member ${member.label} is missing a material assignment.`,
          blocking: true,
        });
      }
    }
  }
};
