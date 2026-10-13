import { ValidatorFunc, addFinding } from "../types.js";

export const validateSecondary: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  for (const member of project.structuralModel.members) {
    if (["PURLIN", "GIRT", "EAVE_STRUT"].includes(member.type)) {
      if (member.sectionId) {
        const section = project.sections.find(s => s.id === member.sectionId);
        if (section && section.family === "COLD_FORMED" && !section.geometryConfig) {
          addFinding(ctx, {
            severity: "REQUIRES_ENGINEERING_REVIEW",
            category: "SECONDARY",
            entityType: "MEMBER",
            entityId: member.id,
            code: "MISSING_EFFECTIVE_PROPERTIES",
            message: `Cold-formed secondary member ${member.label} is missing effective section properties.`,
          });
        }
      }
    }
  }
};
