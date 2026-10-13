import { ValidatorFunc, addFinding } from "../types.js";

export const validateAnalysis: ValidatorFunc = (ctx) => {
  const { project } = ctx;

  for (const run of project.analysisRuns) {
    if (run.provider === "UNAVAILABLE") {
      addFinding(ctx, {
        severity: "WARNING",
        category: "ANALYSIS",
        code: "ANALYSIS_UNAVAILABLE",
        message: `No validated structural analysis solver is configured.`,
        blocking: false,
      });
    }

    let fakeZeroCount = 0;
    for (const res of run.memberResults) {
      if (res.authenticity === "NO_RESULT" && res.axialForce_kN === 0 && res.shearForceY_kN === 0 && res.bendingMomentZ_kNm === 0 && res.displacement_mm === 0) {
         fakeZeroCount++;
      }
    }

    if (fakeZeroCount > 0 && run.provider === "UNAVAILABLE") {
       addFinding(ctx, {
        severity: "ERROR",
        category: "ANALYSIS",
        entityType: "ANALYSIS_RUN",
        entityId: run.id,
        code: "FAKE_ZERO_RESULTS",
        message: `Unavailable analysis provider generated fake zero member results instead of omitting them.`,
        blocking: true,
      });
    }
  }
};
