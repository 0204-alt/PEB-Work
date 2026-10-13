import { ValidatorFunc, addFinding } from "../types.js";

export const validateDesign: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  const hasIS800 = project.designBasis.standards.some(s => s.code.includes("IS 800") && s.applicability === "APPLICABLE");
  
  if (!hasIS800) {
    addFinding(ctx, {
      severity: "WARNING",
      category: "DESIGN",
      code: "MISSING_IS800",
      message: `The project design basis does not list IS 800 as applicable, but the internal engine executes IS 800:2007 checks.`,
    });
  }

  for (const run of project.designRuns) {
    for (const result of run.memberResults) {
      if (result.status === "FAIL") {
        addFinding(ctx, {
          severity: "WARNING",
          category: "DESIGN",
          entityType: "MEMBER_DESIGN_RESULT",
          entityId: result.id,
          code: "DESIGN_FAILURE",
          message: `Member ${result.memberId} fails design checks.`,
        });
      }
    }
  }
};
