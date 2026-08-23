import { createId } from "../ids.js";
import type { CanonicalProject, DesignRun, AnalysisRun } from "../types.js";
import { UnavailableAnalysisProvider } from "./provider.js";

export interface IterationResult {
  analysisRun: AnalysisRun;
  designRun: DesignRun | null;
  convergenceStatus: "CONVERGED" | "NOT_CONVERGED" | "ANALYSIS_UNAVAILABLE";
  iterationNumber: number;
}

export async function runDesignIteration(project: CanonicalProject, iterationNumber = 1): Promise<IterationResult> {
  // 1. Run Analysis
  const provider = new UnavailableAnalysisProvider();
  const analysisRun = await provider.analyze(project);

  // 2. If analysis fails or is unavailable, we must stop the iteration loop.
  // We cannot extract member demands or calculate utilization.
  if (analysisRun.status === "REQUIRES_ENGINEERING_REVIEW" || analysisRun.status === "ANALYSIS_BLOCKED" || analysisRun.status === "ANALYSIS_FAILED") {
    return {
      analysisRun,
      designRun: null, // No fabricated design run
      convergenceStatus: "ANALYSIS_UNAVAILABLE",
      iterationNumber
    };
  }

  // 3. (Unreachable for Phase 10) Extract demands and run Member Design Engine
  // ... actual design execution would go here.

  return {
    analysisRun,
    designRun: null,
    convergenceStatus: "NOT_CONVERGED",
    iterationNumber
  };
}
